// Firebase設定
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id"
};

// Firebase初期化
firebase.initializeApp(firebaseConfig);

// Authインスタンス
const auth = firebase.auth();

// 現在のユーザーを取得
function getCurrentUser() {
    return auth.currentUser;
}

// ログイン状態の監視
function onAuthStateChanged(callback) {
    return auth.onAuthStateChanged(callback);
}

// ログイン機能
async function signInWithEmailAndPassword(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// 新規登録機能
async function createUserWithEmailAndPassword(email, password) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// パスワード変更機能
async function updatePassword(newPassword) {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('ユーザーがログインしていません');
        }
        await user.updatePassword(newPassword);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// パスワードリセット機能
async function sendPasswordResetEmail(email) {
    try {
        await auth.sendPasswordResetEmail(email);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ログアウト機能
async function signOut() {
    try {
        await auth.signOut();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// エラーメッセージを日本語に変換
function getErrorMessage(errorCode) {
    const errorMessages = {
        'auth/user-not-found': 'ユーザーが見つかりません',
        'auth/wrong-password': 'パスワードが間違っています',
        'auth/invalid-email': '無効なメールアドレスです',
        'auth/weak-password': 'パスワードが弱すぎます（6文字以上で入力してください）',
        'auth/email-already-in-use': 'このメールアドレスは既に使用されています',
        'auth/too-many-requests': 'リクエストが多すぎます。しばらく待ってから再試行してください',
        'auth/network-request-failed': 'ネットワークエラーが発生しました',
        'auth/requires-recent-login': 'セキュリティのため、再度ログインしてください'
    };
    
    return errorMessages[errorCode] || 'エラーが発生しました';
} 