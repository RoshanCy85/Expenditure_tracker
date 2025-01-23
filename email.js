import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';

// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyC5vZ3n4d9jbRm6L32ulznJ2aJ3MDnJiIU",
    authDomain: "email-verify-b8039.firebaseapp.com",
    projectId: "email-verify-b8039",
    storageBucket: "email-verify-b8039.firebasestorage.app",
    messagingSenderId: "792323475925",
    appId: "1:792323475925:web:4b3653f9970c943626955c",
    measurementId: "G-F3D0HFTZMR"
  };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const signInUser = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      if (user.emailVerified) {
        console.log('Email is verified. Proceeding with database query.');
        // Proceed with your database query here
      } else {
        console.log('Email is not verified. Access denied.');
        // Inform the user to verify their email
      }
    } catch (error) {
      console.error('Error during sign-in:', error);
    }
  };
// const analytics = getAnalytics(app);

export { auth ,signInUser};
