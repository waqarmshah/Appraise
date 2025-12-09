import React, { useState } from 'react';
import { User } from '../types';
import { Note } from '../types';
import { useTheme } from '../context/ThemeContext';
import { SettingsModal } from './SettingsModal';

interface SidebarProps {
    user: User | null;
    notes: Note[];
    selectedNoteId: string | null;
    onSelectNote: (note: Note) => void;
    onNewEntry: () => void;
    onLogout: () => void;
    currentView: string;
    onChangeView: (view: string) => void;
    onUpdateUser: (updatedUser: Partial<User>) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    user,
    notes,
    selectedNoteId,
    onSelectNote,
    onNewEntry,
    onLogout,
    currentView,
    onChangeView,
    onUpdateUser
}) => {
    const { theme, toggleTheme } = useTheme();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Filter notes based on search
    const filteredNotes = notes.filter(note => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        const titleMatch = (note.title || '').toLowerCase().includes(query);
        const dateMatch = new Date(note.dateCreated).toLocaleDateString().includes(query) || note.dateCreated.includes(query);
        return titleMatch || dateMatch;
    });

    // Group notes by type
    const groupedNotes = filteredNotes.reduce((acc, note) => {
        // Clean type name for display (handle legacy autodetect/Auto-detect)
        let type = note.type || 'Uncategorized';
        if (type === 'Auto-detect' || type.startsWith('autodetect:')) {
            type = 'Clinical Case / Reflection'; // Fallback for legacy display
        }

        if (!acc[type]) acc[type] = [];
        acc[type].push(note);
        return acc;
    }, {} as Record<string, Note[]>);

    const toggleFolder = (type: string) => {
        setExpandedFolders(prev => ({
            ...prev,
            [type]: !prev[type]
        }));
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-[#171717] text-gray-900 dark:text-gray-100 w-[260px] border-r border-gray-200 dark:border-white/5 transition-colors duration-200">
            {/* New Entry Button */}
            <div className="p-3">
                <button
                    onClick={onNewEntry}
                    className="flex items-center gap-3 px-3 py-3 w-full text-sm text-gray-700 dark:text-white bg-white dark:bg-transparent hover:bg-gray-100 dark:hover:bg-[#212121] rounded-lg transition-colors border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 text-left shadow-sm dark:shadow-none"
                >
                    <span className="bg-black dark:bg-white text-white dark:text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold transition-colors">+</span>
                    New entry
                </button>
            </div>

            {/* Navigation / Capabilities */}
            <div className="px-3 py-2">
                <button
                    onClick={() => onChangeView('capabilities')}
                    className={`flex items-center gap-3 px-3 py-2 w-full text-sm rounded-lg transition-colors text-left ${currentView === 'capabilities' ? 'bg-gray-200 dark:bg-[#212121]' : 'hover:bg-gray-200 dark:hover:bg-[#212121]'}`}
                >
                    <span className="text-purple-600 dark:text-purple-400">❖</span>
                    Capabilities
                </button>
            </div>

            {/* Notes List (Folders) */}
            <div className="flex-1 overflow-y-auto px-2 custom-scrollbar">
                {/* Search / Header */}
                <div className="flex items-center justify-between px-3 py-2 mt-4 min-h-[40px]">
                    {!isSearchOpen ? (
                        <>
                            <div className="text-xs font-medium text-gray-500">Notes</div>
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                title="Search Notes"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-1 w-full animate-in fade-in slide-in-from-right-2 duration-200">
                            <input
                                autoFocus
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search..."
                                className="w-full text-xs bg-white dark:bg-[#303030] text-gray-900 dark:text-gray-100 px-2 py-1 rounded border border-blue-500 outline-none"
                            />
                            <button
                                onClick={() => {
                                    setIsSearchOpen(false);
                                    setSearchQuery('');
                                }}
                                className="text-gray-400 hover:text-red-500"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    {Object.keys(groupedNotes).sort().map(type => (
                        <div key={type} className="mb-1">
                            {/* Folder Header */}
                            <button
                                onClick={() => toggleFolder(type)}
                                className="flex items-center justify-between gap-2 px-3 py-2 w-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#212121] rounded-lg transition-colors"
                            >
                                <span className="flex items-center gap-2 truncate">
                                    <span className="text-gray-400 dark:text-gray-500 text-xs">
                                        {(expandedFolders[type] || searchQuery) ? '📂' : '📁'}
                                    </span>
                                    {type}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {groupedNotes[type].length}
                                </span>
                            </button>

                            {/* Folder Content - force expand if searching */}
                            {(expandedFolders[type] || searchQuery) && (
                                <div className="ml-2 pl-2 border-l border-gray-200 dark:border-white/10 space-y-0.5 mt-1">
                                    {groupedNotes[type].sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()).map(note => (
                                        <button
                                            key={note.id}
                                            onClick={() => onSelectNote(note)}
                                            className={`flex items-center gap-3 px-3 py-2 w-full text-sm rounded-lg transition-colors text-left truncate ${selectedNoteId === note.id ? 'bg-gray-200 dark:bg-[#212121]' : 'hover:bg-gray-100 dark:hover:bg-[#212121]/50'}`}
                                        >
                                            <span className="truncate text-gray-600 dark:text-gray-400 text-xs">{note.title || "Untitled"}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {notes.length === 0 && (
                        <div className="px-3 text-xs text-gray-400 dark:text-gray-600 italic">No notes yet</div>
                    )}
                    {notes.length > 0 && filteredNotes.length === 0 && (
                        <div className="px-3 text-xs text-gray-400 dark:text-gray-600 italic">No matches found</div>
                    )}
                </div>
            </div>

            {/* Bottom Section: Theme & User */}
            <div className="p-3 border-t border-gray-200 dark:border-white/10 mt-auto space-y-2">

                {/* Settings Button */}
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="flex items-center gap-3 px-3 py-2 w-full text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#212121] rounded-lg transition-colors"
                >
                    <span className="text-lg">⚙️</span>
                    <span>Settings</span>
                </button>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 px-3 py-2 w-full text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#212121] rounded-lg transition-colors"
                >
                    {theme === 'dark' ? (
                        <>
                            <span>☀️</span>
                            <span>Light Mode</span>
                        </>
                    ) : (
                        <>
                            <span>🌙</span>
                            <span>Dark Mode</span>
                        </>
                    )}
                </button>

                {/* User Profile */}
                <div className="flex items-center gap-3 p-2 hover:bg-gray-200 dark:hover:bg-[#212121] rounded-lg cursor-pointer group relative">
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs text-white">
                            {user?.name?.[0] || 'U'}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.plan === 'appraise_plus' ? 'Appraise Plus' : 'Free Plan'}</p>
                    </div>

                    <button
                        onClick={onLogout}
                        className="absolute right-2 text-xs bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900 text-red-700 dark:text-red-200 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        Log out
                    </button>
                </div>
            </div>

            <SettingsModal
                user={user}
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onUpdateUser={onUpdateUser}
            />
        </div>
    );
};

export default Sidebar;
