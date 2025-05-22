
import { initializeApp } from 'firebase/app';

import { getFirestore } from 'firebase/firestore';
// If you need Authentication
// import { getAuth } from 'firebase/auth';
// If you need Storage
// import { getStorage } from 'firebase/storage';


const firebaseConfig = {
    apiKey: "AIzaSyB1ZCiM02hPB0zR7MWoBLwOJ1ZdsC4JnJk",
    authDomain: "smds-2025.firebaseapp.com",
    projectId: "smds-2025", // Your project ID!
    storageBucket: "smds-2025.firebasestorage.app",
    messagingSenderId: "302371565652",
    appId: "1:302371565652:web:6e82ef46967412e7587dc1",
    measurementId: "G-0H9Q9DR389",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services you need
export const db = getFirestore(app);
// export const auth = getAuth(app);
// export const storage = getStorage(app);

// You might also export the app instance if needed elsewhere
// export { app };
