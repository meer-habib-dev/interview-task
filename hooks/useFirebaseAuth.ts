import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';

/**
 * Custom hook to track Firebase auth state
 */
export function useFirebaseAuth() {
  const { setUser, clearUser, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   // Subscribe to auth state changes
  //   const unsubscribe = onAuthStateChanged(
  //     auth,
  //     (firebaseUser: User | null) => {
  //       setLoading(true);

  //       if (firebaseUser) {
  //         // User is signed in
  //         const userData: User = {
  //           uid: firebaseUser.uid,
  //           email: firebaseUser.email,
  //           displayName: firebaseUser.displayName,
  //           photoURL: firebaseUser.photoURL,
  //           emailVerified: firebaseUser.emailVerified,
  //         };
  //         setUser(userData);
  //       } else {
  //         // User is signed out
  //         clearUser();
  //       }

  //       setLoading(false);
  //     }
  //   );

  //   // Cleanup subscription on unmount
  //   return unsubscribe;
  // }, [setUser, clearUser]);

  return { loading, isAuthenticated };
}
