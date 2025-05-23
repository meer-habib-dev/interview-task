import axios from 'axios';
import { User } from '@/types/auth';
import { auth } from '@/config/firebase';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
} from '@react-native-firebase/auth';

// Initialize Google Sign-In
// Google.GoogleSignin.configure({
//   webClientId:
//     '853601313401-g2j3qpeu49l3ndojnp9n0stthcq509co.apps.googleusercontent.com',
//   iosClientId:
//     '853601313401-inhip613as7cmicf91br62qhdhq2m1co.apps.googleusercontent.com',
// });

const API_URL = 'https://coding-challenge-pd-1a25b1a14f34.herokuapp.com';

/**
 * Login with email and password
 */
export const login = async (
  email: string,
  password: string
): Promise<User | null> => {
  try {
    // First try with the mock API
    const response = await axios.post(`${API_URL}/auth`, {
      email,
      password,
    });

    console.log('response', response);

    if (response.data) {
      const userData: User = {
        uid: 'mock-user-id',
        email: email,
        displayName: response.data.user?.name || 'User',
        photoURL: null,
        emailVerified: true,
      };
      return userData;
    }

    return null;
  } catch (apiError) {
    console.log('Mock API login failed, trying Firebase:', apiError);

    // Fallback to Firebase auth
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userData: User = {
        uid: userCredential.user.uid,
        email: userCredential.user.email || email,
        displayName: userCredential.user.displayName || 'User',
        photoURL: userCredential.user.photoURL,
        emailVerified: userCredential.user.emailVerified,
      };
      return userData;
    } catch (firebaseError) {
      console.error('Firebase login error:', firebaseError);
      throw firebaseError;
    }
  }
};

/**
 * Login with Google
 */
export const loginWithGoogle = async (): Promise<User | null> => {
  try {
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });
    const res = await GoogleSignin.signIn();
    console.log('Google signin response:', res);

    // Check if the response is successful and access the idToken correctly
    if (res.type !== 'success' || !res.data.idToken) {
      throw new Error('Google Sign-In failed to provide ID token');
    }

    // Sign in with credential from the Google user
    const googleCredential = GoogleAuthProvider.credential(res.data.idToken);
    const userCredential = await signInWithCredential(auth, googleCredential);

    const userData: User = {
      uid: userCredential.user.uid,
      email: userCredential.user.email || '',
      displayName: userCredential.user.displayName || 'Google User',
      photoURL: userCredential.user.photoURL,
      emailVerified: userCredential.user.emailVerified,
    };

    return userData;
  } catch (error) {
    console.error('Google login error:', error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
    // Also sign out from Google
    await GoogleSignin.signOut();
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};
