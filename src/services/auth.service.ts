import { auth, googleProvider } from "../config/firebase";
import { signInWithPopup, signOut, User } from "firebase/auth";

export const authService = {
  getCurrentUser: () => auth.currentUser,
  
  signInWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  },

  signOut: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  },

  waitForUser: () => 
    new Promise<User | null>((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user);
      });
    })
}; 