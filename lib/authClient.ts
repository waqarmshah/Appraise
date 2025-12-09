import {
    signInWithPopup,
    GoogleAuthProvider,
    OAuthProvider,
    signOut,
    User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '../types';

export const signInWithGoogle = async () => {
    if (!auth) throw new Error("Firebase Auth not initialized. Check configuration.");
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        await handleUserDocument(result.user, 'google');
        return result.user;
    } catch (error) {
        console.error('Error signing in with Google:', error);
        throw error;
    }
};

export const signInWithApple = async () => {
    if (!auth) throw new Error("Firebase Auth not initialized. Check configuration.");
    try {
        const provider = new OAuthProvider('apple.com');
        const result = await signInWithPopup(auth, provider);
        await handleUserDocument(result.user, 'apple');
        return result.user;
    } catch (error) {
        console.error('Error signing in with Apple:', error);
        throw error;
    }
};

export const signOutUser = async () => {
    if (!auth) return;
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Error signing out:', error);
        throw error;
    }
};

async function handleUserDocument(firebaseUser: FirebaseUser, provider: 'google' | 'apple') {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        // Create new user document
        const newUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || null,
            photoURL: firebaseUser.photoURL || null,
            provider,
            plan: 'free',
            outputs_used_this_month: 0,
            default_mode: 'gp',
            created_at: serverTimestamp() as any, // Cast to any because Client vs Server types can conflict slightly in dev
            updated_at: serverTimestamp() as any,
        };

        // We explicitly exclude created_at/updated_at from the type for creation if strictly typed, 
        // but here we just pass the object. 
        // Typescript might complain about FieldValue vs Date, so we simply ignore strictly for the operation
        // or cast as needed. The interface expects Date or Timestamp structure.
        await setDoc(userRef, newUser);
    } else {
        // Update existing user (e.g. last login or update profile info if changed)
        await updateDoc(userRef, {
            updated_at: serverTimestamp(),
            // Optionally update name/photo if they changed in provider?
            // For now we just touch updated_at
        });
    }
}
