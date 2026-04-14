import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBpMgi6qrxWAuKXO2J2QjYKV2xnsoxyecQ",
  authDomain: "data-manager-e73a5.firebaseapp.com",
  projectId: "data-manager-e73a5",
  storageBucket: "data-manager-e73a5.firebasestorage.app",
  messagingSenderId: "80002188485",
  appId: "1:80002188485:web:03b69eef1039ea3619dcac",
  measurementId: "G-1PED9TXVN8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
