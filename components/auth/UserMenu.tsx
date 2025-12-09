import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoginButtons } from './LoginButtons';

export const UserMenu: React.FC = () => {
    const { user, signOut, loading } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (loading) return <div className="animate-pulse w-8 h-8 rounded-full bg-gray-200"></div>;

    if (!user) {
        return (
            <>
                <button
                    onClick={() => setShowLoginModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                    Log in
                </button>

                {showLoginModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowLoginModal(false)}>
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative" onClick={e => e.stopPropagation()}>
                            <button
                                onClick={() => setShowLoginModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                            <h2 className="text-xl font-bold mb-6 text-center">Sign in to Appraise</h2>
                            <LoginButtons />
                        </div>
                    </div>
                )}
            </>
        );
    }

    const initials = user.name
        ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : user.email.substring(0, 2).toUpperCase();

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 focus:outline-none"
            >
                {user.photoURL ? (
                    <img
                        src={user.photoURL}
                        alt="User profile"
                        className="w-9 h-9 rounded-full border border-gray-200"
                    />
                ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                        {initials}
                    </div>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>

                    <button
                        onClick={() => {
                            // Navigate to Account or Profile if implemented
                            console.log('Navigate to account');
                            setIsOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                        Account
                    </button>

                    <button
                        onClick={() => {
                            signOut();
                            setIsOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                        Log out
                    </button>
                </div>
            )}
        </div>
    );
};
