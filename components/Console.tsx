import React, { useState, useEffect, useRef } from 'react';
import { AppMode, EntryType, Note, UsageStats, User } from '../types';
import { generateAppraisalEntry } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface ConsoleProps {
  user: User | null;
  initialInput?: string;
  onSaveNote: (note: Note) => void;
  usageStats: UsageStats;
  incrementUsage: () => void;
  onRequestLogin: () => void;
}

export const Console: React.FC<ConsoleProps> = ({ 
  user, 
  initialInput = '', 
  onSaveNote, 
  usageStats,
  incrementUsage,
  onRequestLogin
}) => {
  const [input, setInput] = useState(initialInput);
  const [mode, setMode] = useState<AppMode>(AppMode.HOSPITAL);
  const [entryType, setEntryType] = useState<EntryType>(EntryType.AUTO);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState<string | null>(null);
  const [safeguardChecked, setSafeguardChecked] = useState(false);
  const [hasSafeguarding, setHasSafeguarding] = useState(false);
  
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
    if (user?.plan === 'plus') return usageStats.count >= MONTHLY_LIMIT;
    return usageStats.count >= DAILY_LIMIT;
  };

  const toggleDictation = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
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
        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(prev => {
            const separator = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
            return prev + separator + transcript;
          });
        };

        recognitionRef.current = recognition;
        recognition.start();
      } else {
        alert("Speech recognition is not supported in this browser. Please use Chrome or Safari.");
      }
    }
  };

  const handleGenerate = async () => {
    if (!input.trim()) return;
    if (isLimitReached()) return;

    setIsGenerating(true);
    setGeneratedOutput(null);

    const result = await generateAppraisalEntry(input, mode, entryType);
    
    setGeneratedOutput(result);
    incrementUsage();
    setIsGenerating(false);

    // Auto-save logic
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: input.split(' ').slice(0, 6).join(' ') + '...',
      content: result,
      rawInput: input,
      dateCreated: new Date().toISOString(),
      tags: [mode, entryType, hasSafeguarding ? 'Safeguarding' : ''].filter(Boolean),
      mode,
      type: entryType
    };
    
    // Only save automatically if user is logged in (Plus feature mostly, but we simulate saving for all logged in)
    if (user) {
        onSaveNote(newNote);
    }
  };

  const handleCopy = () => {
    if (generatedOutput) {
      navigator.clipboard.writeText(generatedOutput);
      alert('Copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-8 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header / Usage Info */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Console</h1>
            <p className="text-sm text-gray-500 mt-1">Transform your notes into evidence.</p>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium border ${isLimitReached() ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white text-gray-600 border-gray-200 shadow-sm'}`}>
             {user?.plan === 'plus' ? (
                <span>Used {usageStats.count} / {MONTHLY_LIMIT} (Monthly)</span>
             ) : (
                <span>Used {usageStats.count} / {DAILY_LIMIT} (Daily Free)</span>
             )}
          </div>
        </div>

        {isLimitReached() && !user?.plan && (
            <div className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 text-white flex justify-between items-center shadow-lg">
                <div>
                    <span className="font-bold block">Daily limit reached.</span>
                    <span className="text-blue-100 text-sm">Upgrade to Appraise+ for 200 outputs/month and automatic storage.</span>
                </div>
                <button onClick={onRequestLogin} className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors">
                    Upgrade Now
                </button>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* LEFT: Input Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
            <div className="p-6">
              
              {/* Controls */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Mode</label>
                  <div className="relative">
                    <select 
                        value={mode} 
                        onChange={(e) => setMode(e.target.value as AppMode)}
                        className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                    >
                        <option value={AppMode.GP}>GP (FourteenFish)</option>
                        <option value={AppMode.HOSPITAL}>Hospital (MAG)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-[140px]">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Entry Type</label>
                  <div className="relative">
                    <select 
                        value={entryType}
                        onChange={(e) => setEntryType(e.target.value as EntryType)}
                        className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                    >
                        {Object.values(EntryType).map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Area */}
              <div className="relative">
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Write what actually happened, in your own words.&#10;Example: 'Second on-call in AMU, saw four chest pains, supervised an F1 on sepsis and changed the way we triage possible PE...'"
                    className="w-full h-64 p-4 pb-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white resize-none transition-all placeholder-gray-400 text-gray-800 leading-relaxed custom-scrollbar"
                ></textarea>
                
                {/* Textarea Actions */}
                <div className="absolute bottom-3 left-3 flex items-center space-x-2">
                   <button
                      onClick={toggleDictation}
                      className={`
                        flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all
                        ${isListening 
                           ? 'bg-red-50 text-red-600 ring-2 ring-red-100 animate-pulse' 
                           : 'bg-white text-gray-500 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 shadow-sm'}
                      `}
                      title="Dictate note"
                   >
                       {isListening ? (
                         <>
                           <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"/>
                           <span>Listening...</span>
                         </>
                       ) : (
                         <>
                           <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                           <span>Dictate</span>
                         </>
                       )}
                   </button>
                </div>

                <div className="absolute bottom-4 right-4 text-xs text-gray-400 font-medium">
                    {input.length} chars
                </div>
              </div>

              {/* Checks */}
              <div className="mt-4 flex flex-col space-y-3">
                 <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={hasSafeguarding} onChange={(e) => setHasSafeguarding(e.target.checked)} className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"/>
                    <span className="ml-2 text-sm text-gray-600">This includes safeguarding (adult/child)</span>
                 </label>
                 <div className="flex items-start text-amber-600 bg-amber-50 p-3 rounded-lg text-xs">
                    <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    Please do not include patient names or IDs. Use labels like "Mr A", "Patient X".
                 </div>
              </div>

            </div>
            
            {/* Footer Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <button 
                    onClick={() => setInput('')}
                    className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
                >
                    Clear
                </button>
                <button 
                    onClick={handleGenerate}
                    disabled={!input.trim() || isGenerating || isLimitReached()}
                    className={`
                        flex items-center px-6 py-2.5 rounded-full font-bold text-sm shadow-md transition-all
                        ${!input.trim() || isGenerating || isLimitReached() 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg active:scale-95'}
                    `}
                >
                    {isGenerating ? (
                        <>
                           <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                           Thinking...
                        </>
                    ) : (
                        'Generate Entry'
                    )}
                </button>
            </div>
          </div>

          {/* RIGHT: Output Card */}
          <div className="space-y-4">
             {generatedOutput ? (
                 <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden animate-slide-up">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 p-4 flex justify-between items-center">
                        <div className="flex space-x-2">
                             <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">{mode}</span>
                             <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded">{entryType}</span>
                             {hasSafeguarding && <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded">Safeguarding</span>}
                        </div>
                        <div className="flex space-x-2">
                            <button onClick={handleCopy} className="text-gray-400 hover:text-blue-600 transition-colors p-1" title="Copy to clipboard">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                            </button>
                        </div>
                    </div>
                    {/* Content */}
                    <div className="p-8 prose prose-blue max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-800 prose-li:text-gray-800 prose-strong:text-gray-900 text-gray-900">
                        <ReactMarkdown>{generatedOutput}</ReactMarkdown>
                    </div>
                    {/* Footer */}
                    <div className="bg-gray-50 p-4 border-t border-gray-100 text-center text-xs text-gray-400">
                         {user ? 'Auto-saved to Notes' : 'Log in to save this automatically'}
                    </div>
                 </div>
             ) : (
                <div className="h-full min-h-[400px] border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center p-8 text-gray-400">
                    {isGenerating ? (
                        <div className="flex flex-col items-center animate-pulse">
                            <div className="w-16 h-16 bg-blue-100 rounded-full mb-4 flex items-center justify-center">
                                <svg className="w-8 h-8 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            </div>
                            <p className="font-medium text-gray-500">Analysing clinical context...</p>
                            <p className="text-xs mt-2">Mapping to GMC domains...</p>
                        </div>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-gray-50 rounded-full mb-4 flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                            </div>
                            <p className="font-medium">Output will appear here</p>
                            <p className="text-sm mt-1 max-w-xs">Formatted for {mode === AppMode.GP ? 'FourteenFish Portfolio' : 'MAG Appraisal Form'}</p>
                        </>
                    )}
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};