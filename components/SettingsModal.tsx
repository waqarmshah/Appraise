import React, { useState } from 'react';
import { User, AppMode } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface SettingsModalProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdateUser: (updatedUser: Partial<User>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ user, isOpen, onClose, onUpdateUser }) => {
    const [defaultMode, setDefaultMode] = useState<AppMode>((user?.default_mode as AppMode) || AppMode.GP);
    const [customApiKey, setCustomApiKey] = useState(user?.custom_api_key || '');
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen || !user) return null;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const userRef = doc(db, 'users', user.id);
            const updates: any = {
                default_mode: defaultMode,
            };

            // Only update API key if changed (security: don't overwrite with empty if they had one, unless intentional?)
            // For now, simple logic: update whatever is in state
            if (customApiKey !== undefined) {
                updates.custom_api_key = customApiKey;
            }

            await updateDoc(userRef, updates);

            // Update local state
            onUpdateUser(updates);
            onClose();
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Failed to save settings.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#212121] w-full max-w-md rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-white/10">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Settings</h2>

                <div className="space-y-6">
                    {/* Default Mode */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Mode</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="mode"
                                    value={AppMode.GP}
                                    checked={defaultMode === AppMode.GP}
                                    onChange={() => setDefaultMode(AppMode.GP)}
                                    className="accent-purple-600"
                                />
                                <span className="text-gray-700 dark:text-gray-300">GP (FourteenFish)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="mode"
                                    value={AppMode.HOSPITAL}
                                    checked={defaultMode === AppMode.HOSPITAL}
                                    onChange={() => setDefaultMode(AppMode.HOSPITAL)}
                                    className="accent-purple-600"
                                />
                                <span className="text-gray-700 dark:text-gray-300">Hospital (MAG)</span>
                            </label>
                        </div>
                    </div>

                    {/* Custom API Key */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex justify-between">
                            <span>Custom API Key (NanoGPT/OpenAI)</span>
                            {user.plan !== 'appraise_plus' && (
                                <span className="text-xs text-purple-600 bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded">Plus Feature</span>
                            )}
                        </label>
                        <input
                            type="password"
                            value={customApiKey}
                            onChange={(e) => setCustomApiKey(e.target.value)}
                            placeholder="sk-..."
                            className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#303030] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
                        />
                        <p className="text-xs text-gray-500 mt-1">Leave empty to use the system default key.</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};
