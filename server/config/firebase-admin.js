const admin = require('firebase-admin');

const initFirebaseAdmin = () => {
  if (!process.env.FIREBASE_PROJECT_ID) {
    console.warn("⚠️ Firebase Admin credentials not set. Running in Dummy Mode. Only test tokens will bypass auth.");
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
    console.log("✅ Firebase Admin Initialized");
    return admin;
  } catch (err) {
    console.error("❌ Firebase Admin Setup Error", err.message);
  }
};

module.exports = { admin, initFirebaseAdmin };
