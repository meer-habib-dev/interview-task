import { initializeApp, getApp, getApps } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';

// Initialize Firebase if it hasn't been initialized
if (!getApps().length) {
  initializeApp({
    apiKey: 'AIzaSyDuRl7cTQgMRgZIIcamLdw0C3EVfVNEjps',
    authDomain: 'interview-project-6d524.firebaseapp.com',
    projectId: 'interview-project-6d524',
    storageBucket: 'interview-project-6d524.firebasestorage.app',
    messagingSenderId: '659835497018',
    appId: '1:659835497018:ios:51a77a09bf07b65c8f2303',
  });
}

const app = getApp();
const auth = getAuth(app);

export { app, auth };
