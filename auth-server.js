const admin = require('firebase-admin');
require('dotenv').config();

// 環境変数の検証
const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_CLIENT_ID',
  'FIREBASE_CLIENT_CERT_URL'
];

// 必須環境変数のチェック
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ 必須環境変数が設定されていません: ${envVar}`);
    process.exit(1);
  }
}

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
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
  });
  console.log('✅ Firebase Admin SDKが正常に初期化されました');
} catch (error) {
  console.error('❌ Firebase Admin SDKの初期化に失敗:', error);
  process.exit(1);
}

// 認証関連の関数
async function createUser(email, password) {
  try {
    // 入力値の検証
    if (!email || !password) {
      return { success: false, error: 'メールアドレスとパスワードは必須です' };
    }

    // メールアドレスの形式検証
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: '無効なメールアドレス形式です' };
    }

    // パスワードの強度検証
    if (password.length < 6) {
      return { success: false, error: 'パスワードは6文字以上である必要があります' };
    }

    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      emailVerified: false
    });

    console.log('✅ ユーザー作成成功:', userRecord.uid);
    return { success: true, user: userRecord };
  } catch (error) {
    console.error('❌ ユーザー作成エラー:', error);
    
    let errorMessage = 'ユーザーの作成に失敗しました';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'このメールアドレスは既に使用されています';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = '無効なメールアドレスです';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'パスワードが弱すぎます';
    }

    return { success: false, error: errorMessage };
  }
}

async function verifyIdToken(idToken) {
  try {
    if (!idToken) {
      return { success: false, error: 'トークンが提供されていません' };
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // トークンの有効期限をチェック
    const now = Math.floor(Date.now() / 1000);
    if (decodedToken.exp < now) {
      return { success: false, error: 'トークンの有効期限が切れています' };
    }

    console.log('✅ トークン検証成功:', decodedToken.uid);
    return { success: true, user: decodedToken };
  } catch (error) {
    console.error('❌ トークン検証エラー:', error);
    
    let errorMessage = 'トークンの検証に失敗しました';
    if (error.code === 'auth/id-token-expired') {
      errorMessage = 'トークンの有効期限が切れています';
    } else if (error.code === 'auth/id-token-revoked') {
      errorMessage = 'トークンが無効化されています';
    } else if (error.code === 'auth/invalid-id-token') {
      errorMessage = '無効なトークンです';
    }

    return { success: false, error: errorMessage };
  }
}

async function sendPasswordResetEmail(email) {
  try {
    if (!email) {
      return { success: false, error: 'メールアドレスが提供されていません' };
    }

    // メールアドレスの形式検証
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: '無効なメールアドレス形式です' };
    }

    const actionCodeSettings = {
      url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/password-reset-confirm.html`,
      handleCodeInApp: true
    };
    
    await admin.auth().generatePasswordResetLink(email, actionCodeSettings);
    
    console.log('✅ パスワードリセットメール送信成功:', email);
    return { success: true };
  } catch (error) {
    console.error('❌ パスワードリセットエラー:', error);
    
    let errorMessage = 'パスワードリセットメールの送信に失敗しました';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'このメールアドレスで登録されたユーザーが見つかりません';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = '無効なメールアドレスです';
    }

    return { success: false, error: errorMessage };
  }
}

// ユーザー情報を取得する関数
async function getUserInfo(uid) {
  try {
    if (!uid) {
      return { success: false, error: 'ユーザーIDが提供されていません' };
    }

    const userRecord = await admin.auth().getUser(uid);
    return { 
      success: true, 
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        emailVerified: userRecord.emailVerified,
        disabled: userRecord.disabled
      }
    };
  } catch (error) {
    console.error('❌ ユーザー情報取得エラー:', error);
    return { success: false, error: 'ユーザー情報の取得に失敗しました' };
  }
}

module.exports = {
  createUser,
  verifyIdToken,
  sendPasswordResetEmail,
  getUserInfo
}; 