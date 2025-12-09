import React, { useState, useEffect } from 'react';
import { Note, AppMode, EntryType, User } from '../types';
import ReactMarkdown from 'react-markdown';
import { refineAppraisalEntry, getSupervisorFeedback } from '../services/aiService';
import { RCGP_CAPABILITIES, GMC_DOMAINS } from '../constants';
import { SupervisorFeedbackModal } from './SupervisorFeedbackModal';

interface NotesProps {
   user: User | null;
   selectedNote: Note | null;
   onDeleteNote?: (id: string) => void;
   onUpdateNote?: (note: Note) => void;
}

export const Notes: React.FC<NotesProps> = ({ user, selectedNote, onDeleteNote, onUpdateNote }) => {
   // Edit State
   const [isEditing, setIsEditing] = useState(false);
   const [isRefining, setIsRefining] = useState(false);
   const [editContent, setEditContent] = useState('');
   const [editType, setEditType] = useState<string>('');
   const [editTitle, setEditTitle] = useState(''); // New state for title editing
   const [editTags, setEditTags] = useState<string[]>([]);
   const [isAddingTag, setIsAddingTag] = useState(false);
   const [newTagInput, setNewTagInput] = useState('');

   // Supervisor State
   const [showSupervisorModal, setShowSupervisorModal] = useState(false);
   const [supervisorFeedback, setSupervisorFeedback] = useState('');
   const [isSupervisorLoading, setIsSupervisorLoading] = useState(false);

   // Update local state when selectedNote changes
   useEffect(() => {
      if (selectedNote) {
         setEditContent(selectedNote.content);
         setEditType(selectedNote.type);
         setEditTags(selectedNote.tags);

         // Parse Title: [Type] Title [Date]
         // We want to extract just the "Title" part
         // Regex looks for: [Anything] (Group 1) [Anything]
         const titleMatch = selectedNote.title.match(/^\[.*?\]\s+(.*?)\s+\[.*?\]$/);
         if (titleMatch && titleMatch[1]) {
            setEditTitle(titleMatch[1]);
         } else {
            // Fallback: If legacy format, try to strip type prefix if present, else use whole title
            let cleanTitle = selectedNote.title;
            // Remove type prefix if exists (e.g. "Reflection - ...")
            if (cleanTitle.startsWith(selectedNote.type)) {
               cleanTitle = cleanTitle.substring(selectedNote.type.length).replace(/^[\s-:]+/, '');
            }
            // Remove "Auto-detect" prefix if exists
            if (cleanTitle.startsWith('Auto-detect')) {
               cleanTitle = cleanTitle.substring(11).replace(/^[\s-:]+/, '');
            }
            setEditTitle(cleanTitle || "Untitled");
         }

         setIsEditing(false);
         setIsAddingTag(false);
         setNewTagInput('');
      }
   }, [selectedNote]);

   const handleRefine = async () => {
      if (!selectedNote || !editContent) return;
      setIsRefining(true);
      try {
         const typeForAI = Object.values(EntryType).includes(editType as EntryType) ? editType as EntryType : EntryType.AUTO;
         const refined = await refineAppraisalEntry(editContent, selectedNote.mode, typeForAI, user?.custom_api_key);
         setEditContent(refined);
      } catch (error) {
         console.error("Refine failed", error);
         alert("Failed to refine content. Please try again.");
      } finally {
         setIsRefining(false);
      }
   };

   const handleDelete = () => {
      if (!selectedNote || !onDeleteNote) return;
      if (confirm("Delete this entry?")) {
         onDeleteNote(selectedNote.id);
      }
   };

   const handleSaveEdit = () => {
      if (!selectedNote || !onUpdateNote) return;

      // Construct formatted title
      const dateStr = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY
      const typeStr = editType === EntryType.AUTO ? 'Reflection' : editType;
      const finalTitle = `[${typeStr}] ${editTitle} [${dateStr}]`;

      onUpdateNote({
         ...selectedNote,
         title: finalTitle,
         content: editContent,
         type: editType,
         tags: editTags
      });
      setIsEditing(false);
      setIsAddingTag(false);
   };

   const handleDeleteTag = (tagToDelete: string) => {
      setEditTags(prev => prev.filter(t => t !== tagToDelete));
   };

   const handleAddTag = () => {
      const trimmed = newTagInput.trim();
      if (trimmed && !editTags.includes(trimmed)) {
         setEditTags(prev => [...prev, trimmed]);
      }
      setNewTagInput('');
      setIsAddingTag(false);
   };

   const isCapability = (tag: string) => {
      const lowerTag = tag.toLowerCase();
      // Simple inclusive check
      return RCGP_CAPABILITIES.some(cap => cap.toLowerCase().includes(lowerTag) || lowerTag.includes(cap.toLowerCase())) ||
         GMC_DOMAINS.some(dom => dom.toLowerCase().includes(lowerTag) || lowerTag.includes(dom.toLowerCase()));
   };

   const handleSupervise = async () => {
      if (!selectedNote) return;
      setShowSupervisorModal(true);
      setSupervisorFeedback('');
      setIsSupervisorLoading(true);
      try {
         const feedback = await getSupervisorFeedback(selectedNote.content, selectedNote.mode, user?.custom_api_key);
         setSupervisorFeedback(feedback);
      } catch (e) {
         console.error(e);
         setSupervisorFeedback("Failed to generate feedback.");
      } finally {
         setIsSupervisorLoading(false);
      }
   };

   if (!selectedNote) return null;

   return (
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#212121] text-gray-900 dark:text-gray-100 overflow-hidden transition-colors duration-200">
         {/* Scrollable Content Area */}
         <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
            <div className="max-w-3xl mx-auto space-y-10">

               {/* USER MESSAGE (Input) */}
               <div className="flex gap-4 group">
                  <div className="flex-shrink-0 mt-1">
                     {user?.photoURL ? (
                        <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full" />
                     ) : (
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs text-white">U</div>
                     )}
                  </div>
                  <div className="flex-1 space-y-2">
                     <div className="font-semibold text-sm text-gray-900 dark:text-gray-200">{user?.name || 'User'}</div>
                     <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {selectedNote.rawInput}
                     </div>
                  </div>
                  {/* Hidden Actions for User Msg */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                     {/* Could add 'Edit Input' later */}
                  </div>
               </div>

               {/* AI MESSAGE (Output) */}
               <div className="flex gap-4 group pb-20">
                  <div className="flex-shrink-0 mt-1">
                     <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center border border-green-500/20 text-green-600 dark:text-green-500">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                     </div>
                  </div>
                  <div className="flex-1 space-y-2 min-w-0">
                     <div className="flex items-center justify-between">
                        <div className="font-semibold text-sm text-gray-900 dark:text-gray-200">Appraise</div>

                        {/* Action Buttons (Top Right of message) */}
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           {!isEditing ? (
                              <>
                                 <button onClick={() => navigator.clipboard.writeText(selectedNote.content)} className="p-1 hover:text-black dark:hover:text-white text-gray-400" title="Copy">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                 </button>
                                 <button onClick={() => setIsEditing(true)} className="p-1 hover:text-black dark:hover:text-white text-gray-400" title="Edit">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                 </button>
                                 <button onClick={handleDelete} className="p-1 hover:text-red-500 dark:hover:text-red-400 text-gray-400" title="Delete">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                 </button>
                                 <button onClick={handleSupervise} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-xs font-medium transition-colors border border-purple-200 dark:border-purple-800/50" title="Get Supervisor Feedback">
                                    <span>🎓</span>
                                    Supervise
                                 </button>
                              </>
                           ) : (
                              <div className="flex gap-2">
                                 <button onClick={handleRefine} disabled={isRefining} className={`text-xs px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700/50 hover:bg-purple-200 dark:hover:bg-purple-900 ${isRefining ? 'opacity-50' : ''}`}>
                                    {isRefining ? 'Refining...' : 'Refine with AI'}
                                 </button>
                                 <button onClick={handleSaveEdit} className="text-xs px-2 py-1 rounded bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700/50 hover:bg-green-200 dark:hover:bg-green-900">Save</button>
                                 <button onClick={() => setIsEditing(false)} className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">Cancel</button>
                              </div>
                           )}
                        </div>
                     </div>

                     {/* Tags & Metadata Header (Moved to Top) */}
                     <div className="mb-2 flex flex-wrap gap-2 items-center">
                        {/* Mode & Type & Title Edit */}
                        {isEditing ? (
                           <div className="flex items-center gap-2 w-full mb-2">
                              <select
                                 value={editType}
                                 onChange={(e) => setEditType(e.target.value)}
                                 className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-xs border border-red-200 dark:border-red-800/30 rounded px-2 py-1 outline-none font-bold uppercase"
                              >
                                 {Object.values(EntryType).filter(t => t !== EntryType.AUTO).map(t => <option key={t} value={t}>{t}</option>)}
                              </select>

                              <input
                                 type="text"
                                 value={editTitle}
                                 onChange={(e) => setEditTitle(e.target.value)}
                                 className="flex-1 text-sm font-semibold text-gray-900 dark:text-gray-100 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-red-500 outline-none px-1"
                                 placeholder="Title..."
                              />

                              <span className="text-xs text-gray-400 font-mono">
                                 [{new Date().toLocaleDateString('en-GB')}]
                              </span>
                           </div>
                        ) : (
                           <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-xs rounded border border-red-200 dark:border-red-800/50 uppercase font-bold">
                                 {selectedNote.type === EntryType.AUTO ? 'REFLECTION' : selectedNote.type.replace('autodetect:', '')}
                              </span>

                              {/* Display Title nicely if it follows format, else show raw title */}
                              <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                                 {selectedNote.title.match(/^\[.*?\]\s+(.*?)\s+\[.*?\]$/)?.[1] || selectedNote.title}
                              </span>

                              {/* Show Date Badge if parsed */}
                              {selectedNote.title.match(/^\[.*?\]\s+(.*?)\s+\[(.*?)\]$/) && (
                                 <span className="text-xs text-gray-400 font-mono">
                                    [{selectedNote.title.match(/^\[.*?\]\s+(.*?)\s+\[(.*?)\]$/)?.[2]}]
                                 </span>
                              )}
                           </div>
                        )}

                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded border border-gray-200 dark:border-white/10">{selectedNote.mode}</span>

                        {/* Tags */}
                        {((isEditing ? editTags : selectedNote.tags) || []).slice().sort((a, b) => {
                           const cleanA = a.replace('autodetect:', '');
                           const cleanB = b.replace('autodetect:', '');
                           const isCapA = isCapability(cleanA);
                           const isCapB = isCapability(cleanB);
                           if (isCapA && !isCapB) return -1;
                           if (!isCapA && isCapB) return 1;
                           return cleanA.localeCompare(cleanB);
                        }).map(tag => {
                           if (tag === selectedNote.mode || tag === selectedNote.type || tag === `autodetect:${selectedNote.type}` || tag === EntryType.AUTO) return null;
                           const cleanTag = tag.replace('autodetect:', '');
                           const isCap = isCapability(cleanTag);
                           const colorClass = isCap
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800/50'
                              : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800/30';

                           return (
                              <span key={tag} className={`px-2 py-0.5 text-xs rounded border flex items-center gap-1 ${colorClass}`}>
                                 {cleanTag}
                                 {isEditing && (
                                    <button onClick={() => handleDeleteTag(tag)} className="hover:text-black dark:hover:text-white">×</button>
                                 )}
                              </span>
                           )
                        })}

                        {/* Add Tag Button (Edit Mode) */}
                        {isEditing && (
                           isAddingTag ? (
                              <input
                                 autoFocus
                                 value={newTagInput}
                                 onChange={(e) => setNewTagInput(e.target.value)}
                                 onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddTag();
                                    if (e.key === 'Escape') {
                                       setIsAddingTag(false);
                                       setNewTagInput('');
                                    }
                                 }}
                                 onBlur={() => {
                                    if (newTagInput.trim()) handleAddTag();
                                    else setIsAddingTag(false);
                                 }}
                                 className="px-2 py-0.5 text-xs bg-white dark:bg-[#303030] border border-blue-300 dark:border-blue-700 rounded outline-none w-24 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                                 placeholder="New tag..."
                              />
                           ) : (
                              <button
                                 onClick={() => setIsAddingTag(true)}
                                 className="px-2 py-0.5 text-xs rounded border border-dashed border-gray-400 dark:border-gray-500 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 transition-colors"
                                 title="Add Tag"
                              >
                                 + Add
                              </button>
                           )
                        )}
                     </div>

                     {/* Content */}
                     <div className="text-gray-900 dark:text-gray-100 prose dark:prose-invert max-w-none leading-relaxed">
                        {isEditing ? (
                           <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full h-[500px] p-4 bg-gray-50 dark:bg-[#303030] text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-sm leading-relaxed"
                           />
                        ) : (
                           <ReactMarkdown>{selectedNote.content}</ReactMarkdown>
                        )}
                     </div>

                     {/* Tags & Metadata Footer (Removed) */}
                  </div>
               </div>
            </div>
         </div>

         <div className="p-2 text-center text-xs text-gray-500 dark:text-gray-600 bg-white dark:bg-[#212121]">
            Appraise can make mistakes. Check important info.
         </div>

         <SupervisorFeedbackModal
            isOpen={showSupervisorModal}
            onClose={() => setShowSupervisorModal(false)}
            feedback={supervisorFeedback}
            isLoading={isSupervisorLoading}
         />
      </div>
   );
};