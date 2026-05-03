import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Replace with your actual Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAxusaqmH9lbAaYKdOhQZxV4zGsm7cYqSA",
    authDomain: "agenticai-84298.firebaseapp.com",
    projectId: "agenticai-84298",
    storageBucket: "agenticai-84298.firebasestorage.app",
    messagingSenderId: "1051310882292",
    appId: "1:1051310882292:web:5b35189529576d764e4da1",
    measurementId: "G-2DLZCH4QZP"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
