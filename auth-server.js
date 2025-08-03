const admin = require('firebase-admin');
require('dotenv').config();

// Firebase Admin SDKの初期化
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
};

// Firebase Admin SDKを初期化
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
});

// 認証関連の関数
async function createUser(email, password) {
  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      emailVerified: false
    });
    return { success: true, user: userRecord };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function verifyIdToken(idToken) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return { success: true, user: decodedToken };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function sendPasswordResetEmail(email) {
  try {
    const actionCodeSettings = {
      url: `${process.env.FRONTEND_URL}/password-reset-confirm.html`,
      handleCodeInApp: true
    };
    
    await admin.auth().generatePasswordResetLink(email, actionCodeSettings);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = {
  createUser,
  verifyIdToken,
  sendPasswordResetEmail
}; 