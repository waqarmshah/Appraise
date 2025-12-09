import React, { useState, useEffect } from 'react';
import { AppMode } from '../types';
import { VectorAnimation } from './VectorAnimation';

interface LandingPageProps {
    onStart: (initialText: string) => void;
    onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLogin }) => {
    const [inputText, setInputText] = useState('');
    const [activeTab, setActiveTab] = useState<'GP' | 'HOSPITAL'>('GP');

    // Typing animation state
    const [placeholderText, setPlaceholderText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(50);

    const examples = [
        "Today I had three complex palliative patients, we updated ceilings of care and I supervised a junior on DNACPR...",
        "Presented a significant event analysis on a missed sepsis diagnosis. Discussed system factors and new protocol...",
        "Completed an audit on VTE prophylaxis. Sample size 50. Compliance improved from 60% to 85% after intervention..."
    ];

    useEffect(() => {
        const handleTyping = () => {
            const i = loopNum % examples.length;
            const fullText = examples[i];

            setPlaceholderText(
                isDeleting
                    ? fullText.substring(0, placeholderText.length - 1)
                    : fullText.substring(0, placeholderText.length + 1)
            );

            setTypingSpeed(isDeleting ? 30 : 50);

            if (!isDeleting && placeholderText === fullText) {
                setTimeout(() => setIsDeleting(true), 2000);
            } else if (isDeleting && placeholderText === '') {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
            }
        };

        const timer = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timer);
    }, [placeholderText, isDeleting, loopNum, typingSpeed, examples]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onStart(inputText);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0f1014] font-sans transition-colors duration-300">

            {/* Hero Section */}
            <section className="relative pt-40 pb-64 overflow-hidden">
                {/* Background Decoration - Enhanced Contrast */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    {/* Left blob - cooler blue */}
                    <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-blue-200/40 dark:bg-blue-900/20 rounded-full blur-[120px]"></div>
                    {/* Right blob - warmer violet/purple */}
                    <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-indigo-200/50 dark:bg-indigo-900/20 rounded-full blur-[100px]"></div>
                    {/* Bottom center blob */}
                    <div className="absolute bottom-[-10%] left-[20%] w-[700px] h-[700px] bg-purple-100/60 dark:bg-purple-900/20 rounded-full blur-[120px]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-24">

                        {/* Hero Content */}
                        <div className="flex-1 text-center lg:text-left max-w-2xl">
                            <div className="inline-flex items-center py-2 px-4 rounded-full bg-white/60 dark:bg-gray-800/60 border border-blue-100 dark:border-blue-900/30 backdrop-blur-sm shadow-sm mb-10 transition-transform hover:scale-105 cursor-default">
                                <span className="flex items-center justify-center w-5 h-5 mr-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full text-white text-[10px] font-bold">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </span>
                                <span className="text-blue-900 dark:text-blue-200 text-sm font-semibold tracking-wide">
                                    NEW AI MODEL AVAILABLE
                                </span>
                            </div>

                            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold text-gray-900 dark:text-white leading-[1.1] mb-10 tracking-tight">
                                Appraisals don't need to be <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600 bg-300% animate-gradient py-2">difficult</span>.
                            </h1>

                            <p className="text-2xl text-gray-500 dark:text-gray-400 mb-12 leading-relaxed font-light">
                                Type what actually happened on the ward or in clinic. Appraise turns your messy notes into GMC-friendly reflections, case logs, QI write-ups, and PDP goals.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
                                <button onClick={() => window.location.hash = '#demo'} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-10 py-5 rounded-full font-bold text-lg shadow-xl shadow-gray-200 dark:shadow-none hover:bg-black dark:hover:bg-gray-200 hover:-translate-y-1 transition-all w-full sm:w-auto">
                                    Try it now
                                </button>
                                <button onClick={onLogin} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 px-10 py-5 rounded-full font-bold text-lg hover:bg-white dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all w-full sm:w-auto">
                                    Log in
                                </button>
                            </div>

                            <div className="mt-12 flex items-center justify-center lg:justify-start gap-10 text-sm font-medium text-gray-400">
                                <div className="flex items-center"><span className="text-green-500 mr-2 text-xl">✓</span> No credit card required</div>
                                <div className="flex items-center"><span className="text-green-500 mr-2 text-xl">✓</span> GDPR Compliant</div>
                            </div>
                        </div>

                        {/* Interactive Demo Card - Right Side */}
                        <div id="demo" className="flex-1 w-full max-w-xl relative lg:mt-10">
                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-white/10 p-3 transform transition-transform hover:scale-[1.01] duration-500 relative z-10">
                                <div className="bg-white/50 dark:bg-gray-900/50 rounded-[2rem] p-8 border border-gray-100/50 dark:border-gray-700/50">
                                    {/* Fake Tabs */}
                                    <div className="flex bg-gray-100/80 dark:bg-gray-800/80 p-1.5 rounded-2xl mb-8 w-fit mx-auto backdrop-blur-sm">
                                        <button
                                            onClick={() => setActiveTab('GP')}
                                            className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'GP' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                        >
                                            GP
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('HOSPITAL')}
                                            className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'HOSPITAL' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                        >
                                            Hospital
                                        </button>
                                    </div>

                                    {/* Input Area */}
                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        <div className="relative group">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">Your messy notes</label>
                                            <div className="relative">
                                                <textarea
                                                    className="w-full h-52 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-gray-700 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 resize-none shadow-inner transition-all text-lg leading-relaxed"
                                                    placeholder={placeholderText}
                                                    value={inputText}
                                                    onChange={(e) => setInputText(e.target.value)}
                                                    style={{ caretColor: '#3b82f6' }}
                                                ></textarea>
                                            </div>
                                        </div>
                                        <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-5 rounded-2xl font-bold text-lg shadow-lg hover:shadow-blue-200/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center group relative overflow-hidden">
                                            <span className="relative z-10 flex items-center">
                                                Generate Reflection
                                                <svg className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                            </span>
                                        </button>
                                    </form>

                                    <p className="text-center text-sm text-gray-400 mt-8 font-medium">
                                        Free tier: 2 outputs / day. No login needed.
                                    </p>
                                </div>
                            </div>

                            {/* Decorative element behind card */}
                            <div className="absolute -inset-10 bg-gradient-to-tr from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-[3rem] -z-10 blur-2xl opacity-60"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-32 bg-white dark:bg-[#151b2b] relative transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">Tailored for your career stage</h2>
                        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto font-light leading-relaxed">Whether you use FourteenFish, MAG, or a local e-portfolio, Appraise structures your thoughts perfectly.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-16">
                        {/* GP Card */}
                        <div className="bg-slate-50 dark:bg-gray-800/50 rounded-[2rem] p-12 border border-slate-100 dark:border-gray-700 hover:shadow-2xl hover:shadow-blue-100/50 dark:hover:shadow-blue-900/20 transition-all duration-300 group hover:-translate-y-1">
                            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-10 font-bold text-3xl group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-inner">GP</div>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">For GP Trainees</h3>
                            <ul className="space-y-6 text-gray-600 dark:text-gray-300 text-lg">
                                <li className="flex items-start"><span className="mr-4 text-blue-500 mt-1.5 text-xl">•</span> Clinical Case Reviews with Capability linkage</li>
                                <li className="flex items-start"><span className="mr-4 text-blue-500 mt-1.5 text-xl">•</span> Automated Clinical Experience Group tagging</li>
                                <li className="flex items-start"><span className="mr-4 text-blue-500 mt-1.5 text-xl">•</span> QIA & Audit write-ups</li>
                                <li className="flex items-start"><span className="mr-4 text-blue-500 mt-1.5 text-xl">•</span> ESR-ready PDP goals</li>
                            </ul>
                        </div>

                        {/* Hospital Card */}
                        <div className="bg-slate-50 dark:bg-gray-800/50 rounded-[2rem] p-12 border border-slate-100 dark:border-gray-700 hover:shadow-2xl hover:shadow-indigo-100/50 dark:hover:shadow-indigo-900/20 transition-all duration-300 group hover:-translate-y-1">
                            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-10 font-bold text-3xl group-hover:scale-110 group-hover:-rotate-3 transition-transform shadow-inner">H</div>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">For Hospital Doctors</h3>
                            <ul className="space-y-6 text-gray-600 dark:text-gray-300 text-lg">
                                <li className="flex items-start"><span className="mr-4 text-indigo-500 mt-1.5 text-xl">•</span> MAG-style Supporting Information</li>
                                <li className="flex items-start"><span className="mr-4 text-indigo-500 mt-1.5 text-xl">•</span> Mapping to 4 GMC Domains</li>
                                <li className="flex items-start"><span className="mr-4 text-indigo-500 mt-1.5 text-xl">•</span> Significant Event Analysis (SBAR format)</li>
                                <li className="flex items-start"><span className="mr-4 text-indigo-500 mt-1.5 text-xl">•</span> Complaint & Compliment reflections</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing / Plan Comparison */}
            <section id="pricing" className="py-32 bg-[#0f172a] text-white relative overflow-hidden">
                {/* Subtle background glow for dark section */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid md:grid-cols-2 gap-20 items-center">
                        <div className="p-4">
                            <h2 className="text-5xl font-bold mb-10 tracking-tight">Simple, transparent pricing</h2>
                            <p className="text-gray-400 text-xl mb-16 leading-relaxed font-light">Most doctors start with the free tier. Upgrade when you want to automate your entire portfolio workflow.</p>
                            <div className="space-y-12">
                                <div className="flex items-start gap-8">
                                    <div className="w-14 h-14 rounded-2xl bg-gray-800 flex items-center justify-center text-xl font-bold text-blue-400 shrink-0 border border-gray-700">1</div>
                                    <div><p className="font-bold text-2xl mb-2">Type notes quickly</p><p className="text-gray-400 text-lg">Don't worry about grammar. Just get it down.</p></div>
                                </div>
                                <div className="flex items-start gap-8">
                                    <div className="w-14 h-14 rounded-2xl bg-gray-800 flex items-center justify-center text-xl font-bold text-blue-400 shrink-0 border border-gray-700">2</div>
                                    <div><p className="font-bold text-2xl mb-2">Get structured output</p><p className="text-gray-400 text-lg">Ready to copy-paste directly into your appraisal.</p></div>
                                </div>
                            </div>
                        </div>

                        {/* Comparison Table */}
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-[2.5rem] p-12 border border-gray-700 shadow-2xl relative">
                            <div className="grid grid-cols-2 gap-8 mb-12 border-b border-gray-700 pb-12">
                                <div>
                                    <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-4">Free</p>
                                    <p className="text-5xl font-bold">£0</p>
                                </div>
                                <div>
                                    <p className="text-blue-400 text-sm font-bold uppercase tracking-widest mb-4">Appraise+</p>
                                    <p className="text-5xl font-bold">£9 <span className="text-xl text-gray-500 font-normal">/ month</span></p>
                                </div>
                            </div>
                            <div className="space-y-8 text-lg">
                                <div className="grid grid-cols-2 gap-8 items-center">
                                    <div className="text-gray-400">2 outputs / day</div>
                                    <div className="font-bold text-white flex items-center"><span className="text-green-400 mr-2">✓</span> 200 outputs / month</div>
                                </div>
                                <div className="grid grid-cols-2 gap-8 items-center">
                                    <div className="text-gray-400">Manual Copy-paste</div>
                                    <div className="font-bold text-white flex items-center"><span className="text-green-400 mr-2">✓</span> Auto-save to Notes</div>
                                </div>
                                <div className="grid grid-cols-2 gap-8 items-center">
                                    <div className="text-gray-400">Standard Model</div>
                                    <div className="font-bold text-white flex items-center"><span className="text-green-400 mr-2">✓</span> Advanced Medical Model</div>
                                </div>
                                <div className="grid grid-cols-2 gap-8 items-center">
                                    <div className="text-gray-400">-</div>
                                    <div className="font-bold text-white flex items-center"><span className="text-green-400 mr-2">✓</span> Export entire PDF pack</div>
                                </div>
                            </div>
                            <button onClick={onLogin} className="w-full mt-12 bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 rounded-2xl transition-all text-lg shadow-lg hover:shadow-blue-500/25">
                                Start 7-day free trial
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Vector Features Section - "Coming Soon" */}
            <section className="py-32 bg-slate-50 dark:bg-[#151b2b] relative overflow-hidden transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                    {/* Header */}
                    <div className="text-center mb-24">
                        <span className="inline-block py-1 px-3 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 text-xs font-bold uppercase tracking-widest mb-4 border border-purple-200 dark:border-purple-800">Coming Soon</span>
                        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">Vectorise your notes</h2>
                        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto font-light leading-relaxed">
                            Turn your portfolio into a searchable, intelligent brain. Move from a static document store to an active learning partner.
                        </p>
                    </div>

                    {/* Animation Hero */}
                    <div className="mb-24 flex justify-center">
                        <VectorAnimation />
                    </div>

                    {/* Key Advantages Grid */}
                    <div className="mb-24">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-10 text-center">Key Advantages</h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: "🔍",
                                    title: "True Semantic Search",
                                    desc: "Ask \"Show me reflections about sepsis\" and get results for \"deteriorating patients\" and \"NEWS scores\" even if the exact word isn't used."
                                },
                                {
                                    icon: "🕸️",
                                    title: "Cross-linking Ideas",
                                    desc: "The system spots patterns: \"This reflection is similar to 3 other times you struggled with end-of-life discussions.\""
                                },
                                {
                                    icon: "🧠",
                                    title: "Personalized Retrieval",
                                    desc: "Ask \"What have I learned about chest pain this year?\" and get a synthesized learning journey summary."
                                },
                                {
                                    icon: "💡",
                                    title: "Memory-Aware Assistance",
                                    desc: "When generating a QI idea: \"You've mentioned delays in imaging 5 times; want to combine these into a QI proposal?\""
                                },
                                {
                                    icon: "📊",
                                    title: "Better Summarisation",
                                    desc: "Cluster notes by themes (e.g., \"Leadership\") then generate domain-mapped summaries and PDP prompts."
                                },
                                {
                                    icon: "⚖️",
                                    title: "Identifying Gaps",
                                    desc: "Active coaching: \"You have very little evidence for teaching this year. Consider documenting a session.\""
                                },
                                {
                                    icon: "🔮",
                                    title: "Multi-modal Future",
                                    desc: "Uploaded PDFs, audio transcripts, and structured tags all live in the same vector space for unified search."
                                }
                            ].map((item, i) => (
                                <div key={i} className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="text-4xl mb-6">{item.icon}</div>
                                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{item.title}</h4>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Interesting Use Cases List */}
                    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[3rem] p-12 sm:p-20 text-white relative overflow-hidden">

                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>

                        <h3 className="text-3xl font-bold mb-12 relative z-10">What can you build with this?</h3>

                        <div className="grid md:grid-cols-2 gap-x-16 gap-y-12 relative z-10">
                            <div>
                                <h4 className="font-bold text-blue-300 mb-2 uppercase tracking-wide text-sm">Use Case 1</h4>
                                <h5 className="text-xl font-bold mb-3">"Ask My Appraisal Year" Chat</h5>
                                <p className="text-gray-300 leading-relaxed">Synthesises a narrative of your year: "Early in the year you were unsure about feedback, but later entries show confidence."</p>
                            </div>

                            <div>
                                <h4 className="font-bold text-blue-300 mb-2 uppercase tracking-wide text-sm">Use Case 2</h4>
                                <h5 className="text-xl font-bold mb-3">Themed Reflection Builder</h5>
                                <p className="text-gray-300 leading-relaxed">Choose "Breaking Bad News" &rarr; System clusters relevant notes &rarr; Generates a high-level summary reflection.</p>
                            </div>

                            <div>
                                <h4 className="font-bold text-blue-300 mb-2 uppercase tracking-wide text-sm">Use Case 3</h4>
                                <h5 className="text-xl font-bold mb-3">GMC Domain Map Assistant</h5>
                                <p className="text-gray-300 leading-relaxed">"Show me my evidence for Domain 3". Infers domains from content similarity.</p>
                            </div>

                            <div>
                                <h4 className="font-bold text-blue-300 mb-2 uppercase tracking-wide text-sm">Use Case 4</h4>
                                <h5 className="text-xl font-bold mb-3">"Prep my appraisal for me"</h5>
                                <p className="text-gray-300 leading-relaxed">Pulls safety issues, difficult convos, and leadership notes to write your entire appraisals summary.</p>
                            </div>

                            <div>
                                <h4 className="font-bold text-blue-300 mb-2 uppercase tracking-wide text-sm">Use Case 5</h4>
                                <h5 className="text-xl font-bold mb-3">Smart, Fuzzy Search</h5>
                                <p className="text-gray-300 leading-relaxed">"Show me cases where I felt out of my depth" - finds emotion-based matches keywords miss.</p>
                            </div>

                            <div>
                                <h4 className="font-bold text-blue-300 mb-2 uppercase tracking-wide text-sm">Use Case 6</h4>
                                <h5 className="text-xl font-bold mb-3">Safety & Wellbeing Monitor</h5>
                                <p className="text-gray-300 leading-relaxed">"Show me reflections where I felt burnt out." Helps with self-awareness and supervisor discussions.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

        </div>
    );
};