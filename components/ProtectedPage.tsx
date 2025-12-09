import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LoginButtons } from './auth/LoginButtons';

interface ProtectedPageProps {
    children: React.ReactNode;
}

export const ProtectedPage: React.FC<ProtectedPageProps> = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
                    <h1 className="text-2xl font-bold mb-2">Welcome to Appraise</h1>
                    <p className="text-gray-600 mb-8">Please sign in to access this page.</p>
                    <LoginButtons />
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
