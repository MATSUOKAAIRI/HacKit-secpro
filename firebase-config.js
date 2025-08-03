// Firebase SDKを読み込み
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged as firebaseOnAuthStateChanged, createUserWithEmailAndPassword as firebaseCreateUser, signInWithEmailAndPassword as firebaseSignIn, updatePassword as firebaseUpdatePassword, sendPasswordResetEmail as firebaseSendPasswordResetEmail, confirmPasswordReset as firebaseConfirmPasswordReset, signOut as firebaseSignOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

let firebaseConfig = null;
let app = null;
let auth = null;
let isInitialized = false;

async function loadFirebaseConfig() {
  try {
    // Cloudflare Pagesの環境変数を使用
    firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDJ4wJ3YUbXFfvmQdsBVDyd8TZBfmIn3Eg",
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hackit-d394f.firebaseapp.com",
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hackit-d394f",
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hackit-d394f.firebasestorage.app",
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "73269710558",
      appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:73269710558:web:97c3f0061dd8bc72ecbc4f",
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-4MBQ6S9SDC"
    };
    
    // Firebaseを初期化
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    isInitialized = true;
  } catch (error) {
    console.error('Firebase設定の読み込みでエラーが発生しました:', error);
  }
}

// 設定を読み込んでからFirebaseを初期化
loadFirebaseConfig();

export { firebaseConfig, initializeApp, getAuth };

export function validateFirebaseConfig(config) {
  const requiredFields = ['apiKey', 'authDomain', 'projectId'];
  for (const field of requiredFields) {
    if (!config[field]) {
      throw new Error(`Missing required Firebase config field: ${field}`);
    }
  }
  return config;
}

// 初期化完了を待つ関数
async function waitForInitialization() {
  while (!isInitialized) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

export async function onAuthStateChanged(callback) {
  await waitForInitialization();
  if (!auth) {
    console.error('Firebase Auth is not initialized');
    return;
  }
  
  // コールバック関数の検証
  if (typeof callback !== 'function') {
    console.error('onAuthStateChanged: callback must be a function');
    return;
  }
  
  try {
    return firebaseOnAuthStateChanged(auth, callback);
  } catch (error) {
    console.error('認証状態の監視でエラーが発生しました:', error);
    // エラーが発生した場合は、現在のユーザー状態を直接コールバックで通知
    const currentUser = auth.currentUser;
    if (typeof callback === 'function') {
      callback(currentUser);
    }
    return null;
  }
}

export async function createUserWithEmailAndPassword(email, password) {
  await waitForInitialization();
  if (!auth) {
    console.error('Firebase Auth is not initialized');
    return {
      success: false,
      error: 'auth/not-initialized'
    };
  }
  
  try {
    const userCredential = await firebaseCreateUser(auth, email, password);
    return {
      success: true,
      user: userCredential.user
    };
  } catch (error) {
    return {
      success: false,
      error: error.code
    };
  }
}

export async function signInWithEmailAndPassword(email, password) {
  await waitForInitialization();
  if (!auth) {
    console.error('Firebase Auth is not initialized');
    return {
      success: false,
      error: 'auth/not-initialized'
    };
  }
  
  try {
    const userCredential = await firebaseSignIn(auth, email, password);
    return {
      success: true,
      user: userCredential.user
    };
  } catch (error) {
    return {
      success: false,
      error: error.code
    };
  }
}

export async function updatePassword(newPassword) {
  await waitForInitialization();
  if (!auth) {
    console.error('Firebase Auth is not initialized');
    return {
      success: false,
      error: 'auth/not-initialized'
    };
  }
  
  try {
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        error: 'auth/user-not-found'
      };
    }
    await firebaseUpdatePassword(user, newPassword);
    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error.code
    };
  }
}

export async function sendPasswordResetEmail(email) {
  await waitForInitialization();
  if (!auth) {
    console.error('Firebase Auth is not initialized');
    return {
      success: false,
      error: 'auth/not-initialized'
    };
  }
  
  try {
    await firebaseSendPasswordResetEmail(auth, email);
    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error.code
    };
  }
}

export async function confirmPasswordReset(oobCode, newPassword) {
  await waitForInitialization();
  if (!auth) {
    console.error('Firebase Auth is not initialized');
    return {
      success: false,
      error: 'auth/not-initialized'
    };
  }
  
  try {
    await firebaseConfirmPasswordReset(auth, oobCode, newPassword);
    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error.code
    };
  }
}

export function getErrorMessage(errorCode) {
  const errorMessages = {
    'auth/user-not-found': 'ユーザーが見つかりません',
    'auth/wrong-password': 'パスワードが間違っています',
    'auth/email-already-in-use': 'このメールアドレスは既に使用されています',
    'auth/weak-password': 'パスワードが弱すぎます',
    'auth/invalid-email': '無効なメールアドレスです',
    'auth/too-many-requests': 'リクエストが多すぎます。しばらく待ってから再試行してください',
    'auth/network-request-failed': 'ネットワークエラーが発生しました',
    'auth/user-disabled': 'このアカウントは無効化されています',
    'auth/operation-not-allowed': 'この操作は許可されていません',
    'auth/invalid-action-code': '無効なアクションコードです',
    'auth/expired-action-code': 'アクションコードの有効期限が切れています',
    'auth/invalid-verification-code': '無効な確認コードです',
    'auth/invalid-verification-id': '無効な確認IDです',
    'auth/quota-exceeded': 'クォータを超過しました',
    'auth/requires-recent-login': 'セキュリティのため、最近ログインしてください',
    'auth/not-initialized': 'Firebaseが初期化されていません'
  };
  
  return errorMessages[errorCode] || 'エラーが発生しました';
}

export async function getCurrentUser() {
  await waitForInitialization();
  const user = auth ? auth.currentUser : null;
  return user;
}

export async function signOut() {
  await waitForInitialization();
  if (!auth) {
    console.error('Firebase Auth is not initialized');
    return {
      success: false,
      error: 'auth/not-initialized'
    };
  }
  
  try {
    await firebaseSignOut(auth);
    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error.code
    };
  }
} 