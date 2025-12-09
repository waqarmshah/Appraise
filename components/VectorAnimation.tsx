import React, { useEffect, useState } from 'react';

export const VectorAnimation: React.FC = () => {
    const [step, setStep] = useState(0);

    // Animation timeline
    useEffect(() => {
        const interval = setInterval(() => {
            setStep((prev) => (prev + 1) % 6);
        }, 3500); // 3.5s per step
        return () => clearInterval(interval);
    }, []);

    // Steps:
    // 0: Idle / Start
    // 1: Type query "Show me my reflections about sepsis..."
    // 2: Results appear (Deteriorating patient, Rapid response...)
    // 3: Highlight synthesis "Themes: Sepsis, Escalation"
    // 4: Suggestion "Create QI Proposal?"
    // 5: Resetting...

    return (
        <div className="w-full max-w-2xl mx-auto h-[400px] bg-white dark:bg-[#1e1e1e] rounded-3xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden relative font-sans">
            {/* Fake Browser UI */}
            <div className="h-12 border-b border-gray-100 dark:border-white/5 flex items-center px-4 gap-2 bg-gray-50 dark:bg-[#252525]">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                </div>
                <div className="flex-1 text-center text-[10px] text-gray-400 font-mono">appraise-vector-search.demo</div>
            </div>

            <div className="p-8 relative h-full">
                {/* Search Bar Area */}
                <div className="flex justify-center mb-10 relative z-10">
                    <div className={`
                        flex items-center gap-3 px-6 py-4 rounded-2xl bg-white dark:bg-[#252525] border transition-all duration-700 shadow-xl
                        ${step >= 1 ? 'w-full border-blue-500/50 ring-4 ring-blue-500/10' : 'w-2/3 border-gray-200 dark:border-white/10'}
                    `}>
                        <span className="text-gray-400 text-xl">🔍</span>
                        <div className="flex-1 text-lg text-gray-800 dark:text-gray-200 font-medium overflow-hidden whitespace-nowrap">
                            {step === 0 && <span className="opacity-50">Search your portfolio...</span>}
                            {step >= 1 && (
                                <span className="animate-typewriter">
                                    Show me my reflections about sepsis...
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Ghost Mouse Cursor */}
                    <div className={`
                        absolute w-6 h-6 pointer-events-none transition-all duration-1000 z-50
                        ${step === 0 ? 'top-[120%] right-[10%]' : 'top-[50%] right-[15%]'}
                    `}>
                        <svg className="w-full h-full text-black dark:text-white drop-shadow-xl" viewBox="0 0 24 24" fill="currentColor" stroke="white" strokeWidth="2">
                            <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.35Z" />
                        </svg>
                    </div>
                </div>

                {/* Results Grid - Appears Step 2 */}
                <div className="grid grid-cols-1 gap-4 transition-all duration-700 relative">

                    {/* Card 1 */}
                    <div className={`
                        bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 transition-all duration-700 transform origin-top
                        ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 scale-95'}
                    `}>
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Clinical Case</span>
                            <span className="text-[10px] text-gray-400">12 Oct</span>
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">Deteriorating Patient (NEWS 5)</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">...escalated to Reg. Sepsis screen positive...</p>
                    </div>

                    {/* Card 2 */}
                    <div className={`
                        bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800 transition-all duration-700 delay-100 transform origin-top
                        ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 scale-95'}
                    `}>
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Reflection</span>
                            <span className="text-[10px] text-gray-400">03 Nov</span>
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">Rapid Response Call Debrief</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">...communication during handover was key...</p>
                    </div>

                    {/* Connecting Lines (Step 3) */}
                    {step >= 3 && (
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
                            <div className="bg-black/80 dark:bg-white/90 text-white dark:text-black px-4 py-2 rounded-full text-xs font-bold shadow-xl animate-in fade-in zoom-in duration-500">
                                ✨ 3 similar themes found
                            </div>
                        </div>
                    )}
                </div>

                {/* Synthesis / Suggestion (Step 4) */}
                <div className={`
                    absolute bottom-6 left-6 right-6 bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-2xl shadow-2xl text-white flex items-center justify-between transition-all duration-500
                    ${step >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
                `}>
                    <div>
                        <div className="text-xs font-medium opacity-80 uppercase tracking-wider mb-1">AI Suggestion</div>
                        <div className="font-bold text-sm">Merge these into a QI Project on "Sepsis Delays"?</div>
                    </div>
                    <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors">
                        Yes, Draft it
                    </button>
                </div>

            </div>
        </div>
    );
};
