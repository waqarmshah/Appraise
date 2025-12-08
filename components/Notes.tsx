import React, { useState } from 'react';
import { Note, AppMode, EntryType } from '../types';
import ReactMarkdown from 'react-markdown';

interface NotesProps {
  notes: Note[];
}

export const Notes: React.FC<NotesProps> = ({ notes }) => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<AppMode | 'ALL'>('ALL');

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          note.rawInput.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMode = filterMode === 'ALL' || note.mode === filterMode;
    return matchesSearch && matchesMode;
  });

  return (
    <div className="min-h-screen bg-slate-50 pt-8 pb-20 flex flex-col h-screen">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Your Notes</h1>
            <div className="flex space-x-2">
                 <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">Export All</button>
            </div>
          </div>

          <div className="flex flex-1 gap-6 h-[calc(100vh-160px)]">
             {/* Sidebar List */}
             <div className="w-1/3 bg-white rounded-2xl border border-gray-200 flex flex-col shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 space-y-3">
                   <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Search notes..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-100 text-gray-800"
                      />
                      <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                   </div>
                   <div className="flex space-x-2 text-xs">
                      <button 
                        onClick={() => setFilterMode('ALL')}
                        className={`px-3 py-1 rounded-full border ${filterMode === 'ALL' ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                      >
                        All
                      </button>
                      <button 
                        onClick={() => setFilterMode(AppMode.GP)}
                        className={`px-3 py-1 rounded-full border ${filterMode === AppMode.GP ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                      >
                        GP
                      </button>
                      <button 
                        onClick={() => setFilterMode(AppMode.HOSPITAL)}
                        className={`px-3 py-1 rounded-full border ${filterMode === AppMode.HOSPITAL ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                      >
                        Hospital
                      </button>
                   </div>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                   {filteredNotes.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 text-sm">No notes found. Create your first entry in the Console.</div>
                   ) : (
                      filteredNotes.map(note => (
                         <div 
                           key={note.id} 
                           onClick={() => setSelectedNote(note)}
                           className={`p-4 rounded-xl cursor-pointer transition-all ${selectedNote?.id === note.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'hover:bg-gray-50 border border-transparent'}`}
                         >
                            <h3 className="font-semibold text-gray-800 text-sm mb-1 truncate">{note.title}</h3>
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                               <span>{new Date(note.dateCreated).toLocaleDateString()}</span>
                               <span>•</span>
                               <span>{note.type}</span>
                            </div>
                            <p className="text-xs text-gray-400 line-clamp-2">{note.rawInput}</p>
                         </div>
                      ))
                   )}
                </div>
             </div>

             {/* Detail View */}
             <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                {selectedNote ? (
                   <>
                      <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                         <div>
                            <div className="flex space-x-2 mb-2">
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded">{selectedNote.mode}</span>
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs font-semibold rounded">{selectedNote.type}</span>
                                {selectedNote.tags.includes('Safeguarding') && (
                                   <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-semibold rounded">Safeguarding</span>
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">{selectedNote.title}</h2>
                            <p className="text-sm text-gray-400 mt-1">Generated on {new Date(selectedNote.dateCreated).toLocaleString()}</p>
                         </div>
                         <button className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                            Copy Text
                         </button>
                      </div>
                      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 prose prose-blue max-w-none">
                          <ReactMarkdown>{selectedNote.content}</ReactMarkdown>
                      </div>
                   </>
                ) : (
                   <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                      <div className="w-16 h-16 bg-gray-50 rounded-full mb-4 flex items-center justify-center text-2xl text-gray-300">
                         ✎
                      </div>
                      <p>Select a note to view details</p>
                   </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
};