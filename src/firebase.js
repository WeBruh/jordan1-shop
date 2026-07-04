import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBJ2RgjLDrdFfReS7JaQXVfDoP0-2kRjfI",
  authDomain: "jordan1-shop-67998.firebaseapp.com",
  projectId: "jordan1-shop-67998",
  storageBucket: "jordan1-shop-67998.firebasestorage.app",
  messagingSenderId: "554938695317",
  appId: "1:554938695317:web:69e66d7ed81f0b733e59c"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Phones/tablets (and in-app browsers like Instagram/Messenger) frequently
// block or silently fail popup-based sign-in. On those devices we send the
// user through a full-page redirect instead, which is far more reliable.
export const isMobileDevice = () =>
  /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(navigator.userAgent);

export async function signInWithGoogle() {
  if (isMobileDevice()) {
    // Resolves after the page redirects back — onAuthStateChanged picks up the user.
    return signInWithRedirect(auth, googleProvider);
  }
  return signInWithPopup(auth, googleProvider);
}

export { getRedirectResult };
