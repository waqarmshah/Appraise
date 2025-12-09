import React, { useState, useEffect, useRef } from 'react';
import { AppMode, EntryType, Note, UsageStats, User } from '../types';
import { generateAppraisalEntry } from '../services/aiService';
import { RCGP_CAPABILITIES, GMC_DOMAINS } from '../constants';

interface ConsoleProps {
  user: User | null;
  initialInput?: string;
  onSaveNote: (note: Note) => void;
  usageStats: UsageStats;
  incrementUsage: () => void;
  onRequestLogin: () => void;
  onConsumeInitialInput?: () => void;
}

export const Console: React.FC<ConsoleProps> = ({
  user,
  initialInput = '',
  onSaveNote,
  usageStats,
  incrementUsage,
  onRequestLogin,
  onConsumeInitialInput
}) => {
  const [input, setInput] = useState(initialInput);
  const [mode, setMode] = useState<AppMode>((user?.default_mode as AppMode) || AppMode.HOSPITAL);
  const [entryType, setEntryType] = useState<EntryType>(EntryType.AUTO);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasSafeguarding, setHasSafeguarding] = useState(false);

  // Capability State
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [isCapDropdownOpen, setIsCapDropdownOpen] = useState(false);

  // Clear capabilities when mode changes
  useEffect(() => {
    setSelectedCapabilities([]);
  }, [mode]);

  // Update mode if user default changes (optional, but good UX if they change settings while on this page)
  useEffect(() => {
    if (user?.default_mode) {
      setMode(user.default_mode as AppMode);
    }
  }, [user?.default_mode]);

  // Dictation state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea on mount if initial input exists
  useEffect(() => {
    if (initialInput && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [initialInput]);

  const DAILY_LIMIT = 2;
  const MONTHLY_LIMIT = 200;

  const isLimitReached = () => {
    if (user?.plan === 'appraise_plus') return usageStats.count >= MONTHLY_LIMIT;
    return usageStats.count >= DAILY_LIMIT;
  };

  const toggleDictation = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        // @ts-ignore
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-GB';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(prev => (prev.length > 0 && !prev.endsWith(' ') ? prev + ' ' : prev) + transcript);
        };
        recognitionRef.current = recognition;
        recognition.start();
      } else {
        alert("Speech recognition is not supported in this browser.");
      }
    }
  };

  const handleGenerate = async () => {
    if (isGenerating || !input.trim() || isLimitReached()) return;

    setIsGenerating(true);

    // Call AI with custom key if available and linked capabilities
    const { content, tags, detectedType } = await generateAppraisalEntry(
      input,
      mode,
      entryType,
      user?.custom_api_key,
      selectedCapabilities
    );

    incrementUsage();
    setIsGenerating(false);

    // Create and Save Note
    let finalType = (entryType === EntryType.AUTO && detectedType)
      ? detectedType
      : (entryType === EntryType.AUTO ? EntryType.CLINICAL : entryType);

    // Extra safety: If finalType matches 'Auto-detect', force it to Clinical
    if (finalType === EntryType.AUTO || finalType.toLowerCase() === 'auto-detect') {
      finalType = EntryType.CLINICAL;
    }

    const filteredTags = [...tags, ...selectedCapabilities, mode, finalType, hasSafeguarding ? 'Safeguarding' : '']
      .filter(Boolean)
      .filter(t => t !== EntryType.AUTO && t !== 'Auto-detect' && !t.toLowerCase().includes('autodetect:'));

    const dateStr = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY
    // Simple title generation: First 5-6 words or first 40 chars
    const generatedTitle = input.split(' ').slice(0, 6).join(' ').substring(0, 40) + (input.length > 40 ? '...' : '');

    const newNote: Note = {
      id: Date.now().toString(),
      title: `[${finalType}] ${generatedTitle} [${dateStr}]`,
      content: content,
      rawInput: input,
      dateCreated: new Date().toISOString(),
      tags: filteredTags,
      mode,
      type: finalType,
    };

    if (user) {
      onSaveNote(newNote); // This should switch the view in App.tsx
    }

    // Clear input
    setInput('');
  };

  // Auto-run if initialInput provided
  useEffect(() => {
    if (initialInput && onConsumeInitialInput) {
      handleGenerate();
      onConsumeInitialInput();
    }
  }, []);

  return (
    <div className="flex flex-col h-full items-center justify-center p-4 bg-white dark:bg-[#212121] text-gray-900 dark:text-gray-100 relative transition-colors duration-200">

      {/* Centered Content */}
      <div className="flex flex-col items-center w-full max-w-3xl space-y-8 -mt-20">

        {/* Logo / Greeting */}
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center mx-auto mb-6 transition-colors">
            <svg className="w-6 h-6 text-white dark:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">What's on the agenda today?</h2>
        </div>

        {/* Input Card */}
        <div className="w-full bg-white dark:bg-[#303030] rounded-2xl shadow-xl dark:shadow-none border border-gray-200 dark:border-white/5 relative group transition-colors">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe a clinical encounter, procedure, or learning event..."
            className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 p-4 min-h-[120px] max-h-[400px] resize-none focus:outline-none rounded-2xl leading-relaxed custom-scrollbar"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
          />

          {/* Bottom Controls */}
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center space-x-2">
              {/* Dictation */}
              <button
                onClick={toggleDictation}
                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-500 dark:text-gray-400'}`}
                title="Dictate"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              </button>

              {/* Safeguarding Toggle */}
              <button
                onClick={() => setHasSafeguarding(!hasSafeguarding)}
                className={`text-xs px-2 py-1 rounded border transition-colors ${hasSafeguarding ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-500 dark:border-amber-800' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                Safeguarding
              </button>
            </div>

            {/* Send Button */}
            <button
              onClick={handleGenerate}
              disabled={!input.trim() || isGenerating}
              className={`p-2 rounded-lg transition-all ${!input.trim() || isGenerating ? 'bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-500' : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'}`}
            >
              {isGenerating ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <svg className="w-4 h-4 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* Filters/Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as AppMode)}
            className="bg-transparent text-gray-600 dark:text-gray-400 text-sm border border-gray-300 dark:border-white/10 rounded-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#303030] focus:outline-none cursor-pointer transition-colors"
          >
            <option value={AppMode.GP}>GP (FourteenFish)</option>
            <option value={AppMode.HOSPITAL}>Hospital (MAG)</option>
          </select>

          <select
            value={entryType}
            onChange={(e) => setEntryType(e.target.value as EntryType)}
            className="bg-transparent text-gray-600 dark:text-gray-400 text-sm border border-gray-300 dark:border-white/10 rounded-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#303030] focus:outline-none cursor-pointer transition-colors"
          >
            {Object.values(EntryType).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Capability Linker */}
          <div className="relative">
            <button
              onClick={() => setIsCapDropdownOpen(!isCapDropdownOpen)}
              className={`text-sm border rounded-full px-4 py-2 focus:outline-none transition-colors flex items-center gap-2 ${selectedCapabilities.length > 0 ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-300 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-[#303030]'}`}
            >
              <span>Link Capabilities ({selectedCapabilities.length}/3)</span>
              <span className="text-xs">▼</span>
            </button>

            {isCapDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsCapDropdownOpen(false)}></div>
                <div className="absolute top-full left-0 mt-2 w-64 max-h-60 overflow-y-auto bg-white dark:bg-[#303030] rounded-xl shadow-xl border border-gray-200 dark:border-white/10 z-20 custom-scrollbar p-2">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 px-2 uppercase tracking-wider">
                    {mode === AppMode.GP ? 'GP Capabilities' : 'GMC Domains'}
                  </div>
                  {(mode === AppMode.GP ? RCGP_CAPABILITIES : GMC_DOMAINS).map(cap => {
                    const isSelected = selectedCapabilities.includes(cap);
                    const isDisabled = !isSelected && selectedCapabilities.length >= 3;
                    return (
                      <div
                        key={cap}
                        onClick={() => {
                          if (isDisabled) return;
                          if (isSelected) setSelectedCapabilities(prev => prev.filter(c => c !== cap));
                          else setSelectedCapabilities(prev => [...prev, cap]);
                        }}
                        className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer text-sm transition-colors ${isSelected ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100' : isDisabled ? 'opacity-50 cursor-not-allowed text-gray-400' : 'hover:bg-gray-100 dark:hover:bg-[#404040] text-gray-700 dark:text-gray-200'}`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="mt-1"
                        />
                        <span className="leading-tight">{cap}</span>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>


      </div>

      {/* Footer Info */}
      <div className="absolute bottom-4 text-xs text-gray-400 dark:text-gray-500">
        Appraise can make mistakes. Please verify generated content.
      </div>
    </div>
  );
};