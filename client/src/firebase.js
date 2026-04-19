import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC6Cpkv0C7FqtF6fr8xcW1AxgX2TcdCSy8",
  authDomain: "balajee-e-com.firebaseapp.com",
  projectId: "balajee-e-com",
  storageBucket: "balajee-e-com.firebasestorage.app",
  messagingSenderId: "598212093137",
  appId: "1:598212093137:web:180baafb4c5331b5af91f0",
  measurementId: "G-T86BHVMVQD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { signInWithPopup };
