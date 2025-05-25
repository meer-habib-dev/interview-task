import axios from 'axios';
import { User } from '@/types/auth';
import { auth } from '@/config/firebase';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  GoogleAuthProvider,
  signInWithCredential,
} from '@react-native-firebase/auth';

const API_URL = 'https://coding-challenge-pd-1a25b1a14f34.herokuapp.com';

/**
 * Login with email and password
 */
export const login = async (
  email: string,
  password: string
): Promise<User | null> => {
  try {
    const response = await axios.post(`${API_URL}/auth`, {
      email,
      password,
    });

    if (response.data) {
      const userData: User = {
        uid: 'mock-user-id',
        email: email,
        displayName: response.data.user?.name || 'User',
        photoURL: null,
        emailVerified: true,
        provider: 'email',
      };
      return userData;
    }

    return null;
  } catch (apiError) {
    throw apiError;
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

    // Check if the response is successful and access the idToken correctly
    if (res.type !== 'success' || !res.data.idToken) {
      throw new Error('Google Sign-In failed to provide ID token');
    }

    const googleCredential = GoogleAuthProvider.credential(res.data.idToken);
    const userCredential = await signInWithCredential(auth, googleCredential);

    const userData: User = {
      uid: userCredential.user.uid,
      email: userCredential.user.email || '',
      displayName: userCredential.user.displayName || 'Google User',
      photoURL: userCredential.user.photoURL,
      emailVerified: userCredential.user.emailVerified,
      provider: 'google',
    };

    return userData;
  } catch (error) {
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    throw error;
  }
};
