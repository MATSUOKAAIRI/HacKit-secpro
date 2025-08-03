
let firebaseConfig = null;

async function loadFirebaseConfig() {
  const response = await fetch('/api/config');
  const config = await response.json();
  
  firebaseConfig = {
    apiKey: config.firebase.apiKey,
    authDomain: config.firebase.authDomain,
    projectId: config.firebase.projectId,
    storageBucket: config.firebase.storageBucket,
    messagingSenderId: config.firebase.messagingSenderId,
    appId: config.firebase.appId,
    measurementId: config.firebase.measurementId
  };
  
  // Firebaseを初期化
  firebase.initializeApp(firebaseConfig);
}

// 設定を読み込んでからFirebaseを初期化
loadFirebaseConfig();

export { firebaseConfig };

export function validateFirebaseConfig(config) {
  const requiredFields = ['apiKey', 'authDomain', 'projectId'];
  for (const field of requiredFields) {
    if (!config[field]) {
      throw new Error(`Missing required Firebase config field: ${field}`);
    }
  }
  return config;
}

const auth = firebase.auth();

export function onAuthStateChanged(callback) {
  return auth.onAuthStateChanged(callback);
}

export async function createUserWithEmailAndPassword(email, password) {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
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
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
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
  try {
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        error: 'auth/user-not-found'
      };
    }
    await user.updatePassword(newPassword);
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
  try {
    await auth.sendPasswordResetEmail(email);
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
  try {
    await auth.confirmPasswordReset(oobCode, newPassword);
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
    'auth/requires-recent-login': 'セキュリティのため、最近ログインしてください'
  };
  
  return errorMessages[errorCode] || 'エラーが発生しました';
}

export function getCurrentUser() {
  return auth.currentUser;
}

export async function signOut() {
  try {
    await auth.signOut();
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