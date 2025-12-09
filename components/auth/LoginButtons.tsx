import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const LoginButtons: React.FC = () => {
    const { signInWithGoogle, signInWithApple, simulateLogin } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setError(null);
        setIsLoading(true);
        try {
            await signInWithGoogle();
        } catch (err: any) {
            setError(err.message || 'Failed to sign in with Google');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAppleLogin = async () => {
        setError(null);
        setIsLoading(true);
        try {
            await signInWithApple();
        } catch (err: any) {
            setError(err.message || 'Failed to sign in with Apple');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-3 w-full max-w-sm">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-2 border border-red-200">
                    {error}
                </div>
            )}

            <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
            >
                <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google logo"
                    className="w-5 h-5"
                />
                {isLoading ? 'Connecting...' : 'Continue with Google'}
            </button>

            <button
                onClick={handleAppleLogin}
                disabled={isLoading}
                className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
            >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M17.5 12.6c0-2.5 2-3.7 2.1-3.7-.1-.2-.5-1.7-1.9-2.3-1.2-.5-2.2-.1-2.9 0-1.1.2-2.1.8-2.6 1.3-.4-.3-1-.9-2.2-1-1.8-.1-3.2 1-4 2.5-1.7 2.9-.4 7.2 1.2 9.5.8 1.1 1.7 2.4 2.9 2.3 1.1-.1 1.6-.7 3-.7 1.3 0 1.7.7 2.9.7 1.2 0 1.9-1.1 2.9-2.6s1.5-3.4 1.5-3.5c-.1 0-2.8-1.1-2.9-3.5zM15.4 5.7c.6-1.1 1.1-2.4 1-3.7-1.1.1-2.5.7-3.2 1.7-.6 1-1.1 2.3-1 3.5 1.2.1 2.6-.4 3.2-1.5z" />
                </svg>
                {isLoading ? 'Connecting...' : 'Continue with Apple'}
            </button>

            {/* Dev Mode Login */}
            <div className="pt-2 border-t border-gray-100 mt-2">
                <button
                    onClick={simulateLogin}
                    className="w-full py-2 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors font-medium border border-blue-100 border-dashed"
                >
                    Test Login (Simulated)
                </button>
            </div>
        </div>
    );
};
