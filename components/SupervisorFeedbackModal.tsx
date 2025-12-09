import React from 'react';
import ReactMarkdown from 'react-markdown';

interface SupervisorFeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    feedback: string;
    isLoading: boolean;
}

export const SupervisorFeedbackModal: React.FC<SupervisorFeedbackModalProps> = ({ isOpen, onClose, feedback, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#212121] w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-white/10">

                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gradient-to-r from-purple-50 to-white dark:from-purple-900/10 dark:to-[#212121] rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🎓</span>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Supervisor Feedback</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Educational supervisor review of your reflection</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
                            <p className="text-gray-500 dark:text-gray-400 animate-pulse">Analysing reflection against training standards...</p>
                        </div>
                    ) : (
                        <div className="prose dark:prose-invert max-w-none text-sm md:text-base leading-relaxed">
                            <ReactMarkdown>{feedback}</ReactMarkdown>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-white/10 flex justify-end gap-3 bg-gray-50 dark:bg-[#303030] rounded-b-2xl">
                    <button
                        onClick={() => navigator.clipboard.writeText(feedback)}
                        className="px-4 py-2 text-sm bg-white dark:bg-[#424242] border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-[#505050] text-gray-700 dark:text-gray-200 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                        Copy Feedback
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};
