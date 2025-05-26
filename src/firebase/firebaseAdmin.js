// src/firebase/firebaseAdmin.js (or .ts if you prefer)
import admin from 'firebase-admin';

// Ensure this path is correct for your service account key
// const serviceAccount = require('../../../path/to/your/serviceAccountKey.json'); // Adjust path

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      // Option 1: Use environment variables (Recommended for security)
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Ensure FIREBASE_PRIVATE_KEY has newlines correctly parsed (e.g., .replace(/\\n/g, '\n'))
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      // Option 2: Directly use service account object (less secure for repository)
      // credential: admin.credential.cert(serviceAccount),
      // storageBucket: 'your-project-id.appspot.com' // Replace with your bucket name if using option 2
    });
    console.log("Firebase Admin SDK Initialized");
  } catch (error) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

export default admin;