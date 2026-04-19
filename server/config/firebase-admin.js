const admin = require('firebase-admin');

let isFirebaseInitialized = false;

const initFirebaseAdmin = () => {
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    console.warn("⚠️ Firebase Admin credentials incomplete in .env. Social login is disabled.");
    return null;
  }
  
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
    isFirebaseInitialized = true;
    console.log("✅ Firebase Admin Initialized");
    return admin;
  } catch (err) {
    console.error("❌ Firebase Admin Setup Error", err.message);
    isFirebaseInitialized = false;
  }
};

module.exports = { admin, initFirebaseAdmin, getIsFirebaseInitialized: () => isFirebaseInitialized };
