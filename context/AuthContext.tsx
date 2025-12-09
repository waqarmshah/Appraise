import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User } from '../types';
import { signInWithGoogle as googleSignIn, signInWithApple as appleSignIn, signOutUser as userSignOut } from '../lib/authClient';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithApple: () => Promise<void>;
    signOut: () => Promise<void>;
    simulateLogin: () => Promise<void>;
    updateLocalUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInWithGoogle: async () => { },
    signInWithApple: async () => { },
    signOut: async () => { },
    simulateLogin: async () => { },
    updateLocalUser: () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const isSimulatedRef = React.useRef(false);

    useEffect(() => {
        if (!auth) {
            console.warn("Auth not initialized. Config missing?");
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                isSimulatedRef.current = false; // Real login overrides sync
                try {
                    // Fetch user details from Firestore
                    const userRef = doc(db, 'users', firebaseUser.uid);
                    const userSnap = await getDoc(userRef);

                    if (userSnap.exists()) {
                        const userData = userSnap.data();
                        // Safe parsing or casting
                        setUser({
                            id: firebaseUser.uid,
                            email: firebaseUser.email || '',
                            name: userData.name || firebaseUser.displayName || null,
                            photoURL: userData.photoURL || firebaseUser.photoURL || null,
                            provider: userData.provider || (firebaseUser.providerData[0]?.providerId.includes('google') ? 'google' : 'apple'),
                            plan: userData.plan || 'free',
                            outputs_used_this_month: userData.outputs_used_this_month || 0,
                            default_mode: userData.default_mode || 'gp',
                            created_at: userData.created_at?.toDate ? userData.created_at.toDate() : userData.created_at,
                            updated_at: userData.updated_at?.toDate ? userData.updated_at.toDate() : userData.updated_at,
                        } as User);
                    } else {
                        // Fallback if document doesn't exist yet (race condition possible but rare if created on login)
                        setUser(null);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setUser(null);
                }
            } else {
                if (!isSimulatedRef.current) {
                    setUser(null);
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        try {
            await googleSignIn();
            // State update happens via onAuthStateChanged
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const signInWithApple = async () => {
        try {
            await appleSignIn();
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    // Dev Mode Simulation
    const simulateLogin = async () => {
        const MOCK_USER: User = {
            id: 'dev_user_123',
            name: 'Dr. Dev User',
            email: 'dev@local.test',
            photoURL: 'https://ui-avatars.com/api/?name=Dev+User&background=0D8ABC&color=fff',
            provider: 'google',
            plan: 'appraise_plus',
            outputs_used_this_month: 10,
            default_mode: 'gp'
        };
        isSimulatedRef.current = true;
        setUser(MOCK_USER);
        setLoading(false);
    };

    const signOut = async () => {
        try {
            if (user?.id === 'dev_user_123') {
                isSimulatedRef.current = false;
                setUser(null);
                return;
            }
            await userSignOut();
        } catch (error) {
            console.error(error);
        }
    };

    const updateLocalUser = (updates: Partial<User>) => {
        if (user) {
            setUser({ ...user, ...updates });
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithApple, signOut, simulateLogin, updateLocalUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
