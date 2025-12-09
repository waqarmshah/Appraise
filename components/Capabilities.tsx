import React, { useState } from 'react';
import { Note, AppMode } from '../types';
import { RCGP_CAPABILITIES, GMC_DOMAINS } from '../constants';

interface CapabilitiesProps {
    notes: Note[];
    mode: AppMode;
}

export const Capabilities: React.FC<CapabilitiesProps> = ({ notes, mode }) => {
    const [activeTab, setActiveTab] = useState<'GP' | 'HOSPITAL'>(
        mode === AppMode.GP ? 'GP' : 'HOSPITAL'
    );

    const capabilities = activeTab === 'GP' ? RCGP_CAPABILITIES : GMC_DOMAINS;

    // Helper to find notes matching a capability
    const getNotesForCapability = (capability: string) => {
        return notes.filter(note =>
            note.tags.some(tag => tag.toLowerCase().includes(capability.toLowerCase()))
        );
    };

    return (
        <div className="flex-1 overflow-y-auto bg-white dark:bg-[#212121] text-gray-900 dark:text-gray-100 p-8 custom-scrollbar transition-colors duration-200">
            <div className="max-w-7xl mx-auto">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Capabilities & Coverage</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Track your portfolio coverage against valid curriculum domains.</p>
                </div>

                {/* Toggles */}
                <div className="flex space-x-4 mb-8">
                    <button
                        onClick={() => setActiveTab('GP')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'GP'
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-white dark:bg-[#303030] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#404040] border border-gray-200 dark:border-white/5'
                            }`}
                    >
                        GP (RCGP)
                    </button>
                    <button
                        onClick={() => setActiveTab('HOSPITAL')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'HOSPITAL'
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-white dark:bg-[#303030] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#404040] border border-gray-200 dark:border-white/5'
                            }`}
                    >
                        Hospital (GMC)
                    </button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {capabilities.map((cap) => {
                        const matchingNotes = getNotesForCapability(cap);
                        const count = matchingNotes.length;
                        const progress = Math.min(count * 20, 100);

                        return (
                            <div key={cap} className="bg-white dark:bg-[#303030] rounded-xl shadow-lg border border-gray-200 dark:border-white/5 p-6 hover:border-gray-300 dark:hover:border-white/10 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm leading-tight h-10 line-clamp-2" title={cap}>
                                        {cap}
                                    </h3>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${count > 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                                        {count}
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mb-4">
                                    <div
                                        className={`h-1.5 rounded-full transition-all duration-500 ${count > 0 ? 'bg-purple-500' : 'bg-gray-600'}`}
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>

                                {/* Evidence List */}
                                <div className="space-y-2">
                                    {matchingNotes.length > 0 ? (
                                        <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                            {matchingNotes.slice(0, 3).map(note => (
                                                <li key={note.id} className="truncate hover:text-blue-600 dark:hover:text-white cursor-pointer">
                                                    • {note.title}
                                                </li>
                                            ))}
                                            {matchingNotes.length > 3 && (
                                                <li className="text-gray-400 dark:text-gray-500 italic pl-2">+ {matchingNotes.length - 3} more</li>
                                            )}
                                        </ul>
                                    ) : (
                                        <p className="text-xs text-gray-400 dark:text-gray-600 italic">No linked evidence yet.</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
