// Firebase Automation機能を活用したクライアントサイド認証ライブラリ

class AuthClient {
  constructor() {
    this.baseURL = window.location.origin;
    this.token = localStorage.getItem('authToken');
    this.user = JSON.parse(localStorage.getItem('user'));
    this.auth = null;
    this.app = null;
    this.db = null;
    this.isInitialized = false;
  }

  // Firebase初期化
  async initializeFirebase() {
    try {
      // 既に初期化されている場合は何もしない
      if (this.isInitialized && this.auth && this.db) {
        console.log('Firebaseは既に初期化されています');
        return;
      }
      
      // Firebase設定を取得
      const config = await this.getFirebaseConfig();
      
      // Firebase SDKをインポート
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
      const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
      const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

      this.app = initializeApp({
        apiKey: config.apiKey, // サーバーから動的に取得
        authDomain: config.authDomain,
        projectId: config.projectId,
        storageBucket: config.storageBucket,
        messagingSenderId: config.messagingSenderId,
        appId: config.appId,
        measurementId: config.measurementId
      });
      
      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);
      this.isInitialized = true;
      console.log('Firebase認証とFirestoreが初期化されました');
      
      // 認証状態の変更を監視
      onAuthStateChanged(this.auth, async (user) => {
        console.log('Firebase Auth状態変更:', user ? `ログイン済み (${user.email})` : '未ログイン');
        
        if (user) {
          // ログイン済みの場合
          const idToken = await user.getIdToken();
          this.token = idToken;
          this.user = {
            uid: user.uid,
            email: user.email
          };
          localStorage.setItem('authToken', idToken);
          localStorage.setItem('user', JSON.stringify(this.user));
        } else {
          // 未ログインの場合
          this.token = null;
          this.user = null;
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
        
        // 認証状態を更新
        authStateManager.updateAuthState(this.user);
      });
      
    } catch (error) {
      console.error('Firebase初期化エラー:', error);
      throw error;
    }
  }

  // Firebase設定を取得
  async getFirebaseConfig() {
    try {
      // まず環境変数から取得を試行
      if (window.FIREBASE_API_KEY) {
        console.log('📋 環境変数からFirebase設定を取得');
        return {
          apiKey: window.FIREBASE_API_KEY,
          authDomain: window.FIREBASE_AUTH_DOMAIN,
          projectId: window.FIREBASE_PROJECT_ID,
          storageBucket: window.FIREBASE_STORAGE_BUCKET,
          messagingSenderId: window.FIREBASE_MESSAGING_SENDER_ID,
          appId: window.FIREBASE_APP_ID,
          measurementId: window.FIREBASE_MEASUREMENT_ID
        };
      }

      // サーバーから取得を試行
      const response = await fetch(`${this.baseURL}/api/firebase-config`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const config = await response.json();
      console.log('📋 サーバーからFirebase設定を取得:', {
        authDomain: config.authDomain,
        projectId: config.projectId
      });
      return config;
    } catch (error) {
      console.error('Firebase設定の取得に失敗:', error);
      throw new Error('Firebase設定の取得に失敗しました。サーバーに接続できません。');
    }
  }

  // ユーザー登録
  async signup(email, password) {
    try {
      if (!this.auth) {
        await this.initializeFirebase();
      }

      const { createUserWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
      
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      // IDトークンを取得
      const idToken = await user.getIdToken();
      
      // ユーザー情報を保存
      this.token = idToken;
      this.user = {
        uid: user.uid,
        email: user.email
      };
      
      localStorage.setItem('authToken', idToken);
      localStorage.setItem('user', JSON.stringify(this.user));

      // 認証状態を更新
      authStateManager.updateAuthState(this.user);

      return {
        success: true,
        message: 'アカウントの作成に成功しました',
        user: this.user
      };

    } catch (error) {
      console.error('ユーザー登録エラー:', error);
      
      let errorMessage = 'アカウントの作成に失敗しました';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'このメールアドレスは既に使用されています';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '無効なメールアドレスです';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'パスワードが弱すぎます';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // ログイン
  async login(email, password) {
    try {
      if (!this.auth) {
        await this.initializeFirebase();
      }

      const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
      
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      // IDトークンを取得
      const idToken = await user.getIdToken();
      
      // ユーザー情報を保存
      this.token = idToken;
      this.user = {
        uid: user.uid,
        email: user.email
      };
      
      localStorage.setItem('authToken', idToken);
      localStorage.setItem('user', JSON.stringify(this.user));

      // 認証状態を更新
      authStateManager.updateAuthState(this.user);

      return {
        success: true,
        message: 'ログインに成功しました',
        user: this.user
      };

    } catch (error) {
      console.error('ログインエラー:', error);
      
      let errorMessage = 'ログインに失敗しました';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'ユーザーが見つかりません';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'パスワードが間違っています';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '無効なメールアドレスです';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // ログアウト
  async logout() {
    try {
      if (!this.auth) {
        await this.initializeFirebase();
      }

      const { signOut } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
      
      await signOut(this.auth);

      // ローカルストレージをクリア
      this.token = null;
      this.user = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');

      // 認証状態を更新
      authStateManager.updateAuthState(null);

      return { success: true };
    } catch (error) {
      console.error('ログアウトエラー:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 現在のユーザーを取得
  async getCurrentUser() {
    try {
      if (!this.auth) {
        await this.initializeFirebase();
      }

      const user = this.auth.currentUser;
      
      if (user) {
        // IDトークンを更新
        const idToken = await user.getIdToken();
        
        this.token = idToken;
        this.user = {
          uid: user.uid,
          email: user.email
        };
        
        localStorage.setItem('authToken', idToken);
        localStorage.setItem('user', JSON.stringify(this.user));
        
        return this.user;
      }

      // ローカルストレージから認証状態を復元
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('ローカルストレージから認証状態を復元:', parsedUser.email);
          
          // ローカルストレージの情報を信頼（簡易的な復元）
          this.token = storedToken;
          this.user = parsedUser;
          
          return this.user;
        } catch (error) {
          console.error('ローカルストレージの認証状態復元エラー:', error);
          // 無効なデータの場合はクリア
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      }

      return null;
    } catch (error) {
      console.error('ユーザー取得エラー:', error);
      return null;
    }
  }

  // 投稿を作成（Firestore直接接続）
  async createPost(postData) {
    try {
      if (!this.db) {
        await this.initializeFirebase();
      }

      const user = this.auth.currentUser;
      if (!user) {
        throw new Error('認証が必要です');
      }

      const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      
      // Firestoreに直接投稿を保存
      const docRef = await addDoc(collection(this.db, "opinion"), {
        title: postData.title,
        details: postData.details,
        category: postData.category,
        place: postData.place,
        empathy: 0,
        userId: user.uid,
        createdAt: serverTimestamp()
      });

      return {
        success: true,
        message: '投稿が成功しました',
        postId: docRef.id
      };

    } catch (error) {
      console.error('投稿エラー:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 投稿一覧を取得（Firestore直接接続）
  async getPosts() {
    try {
      if (!this.db) {
        await this.initializeFirebase();
      }

      const { collection, query, orderBy, limit, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      
      // Firestoreから直接投稿を取得
      const q = query(
        collection(this.db, "opinion"),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      const posts = [];
      
      snapshot.forEach(doc => {
        posts.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        success: true,
        posts: posts
      };

    } catch (error) {
      console.error('投稿取得エラー:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 認証状態をチェック
  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  // ユーザー情報を取得
  getUser() {
    return this.user;
  }

  // IDトークンを取得
  async getIdToken() {
    try {
      if (!this.auth) {
        await this.initializeFirebase();
      }

      const user = this.auth.currentUser;
      if (user) {
        return await user.getIdToken();
      }
      return null;
    } catch (error) {
      console.error('IDトークン取得エラー:', error);
      return null;
    }
  }

  // 共感を追加
  async addEmpathy(postId) {
    try {
      if (!this.db) {
        await this.initializeFirebase();
      }

      const user = this.auth.currentUser;
      if (!user) {
        throw new Error('認証が必要です');
      }

      const { doc, updateDoc, increment, arrayUnion } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      
      const docRef = doc(this.db, "opinion", postId);
      await updateDoc(docRef, {
        empathy: increment(1),
        empathizedUsers: arrayUnion(user.uid)
      });

      return { success: true };
    } catch (error) {
      console.error('共感追加エラー:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Firestoreのdbインスタンスを取得（他のスクリプトで使用）
  async getFirestoreDB() {
    if (!this.db) {
      await this.initializeFirebase();
    }
    return this.db;
  }

}

// グローバルインスタンスを作成
const authClient = new AuthClient();

// 認証状態の監視
class AuthStateManager {
  constructor() {
    this.listeners = [];
    this.currentUser = null;
    this.isInitialized = false;
    this.initializationPromise = null;
  }

  // リスナーを追加
  addListener(callback) {
    this.listeners.push(callback);
    
    // 現在の状態を即座に通知
    if (this.currentUser !== null) {
      callback(this.currentUser);
    }
  }

  // 認証状態を更新
  updateAuthState(user) {
    console.log('認証状態を更新:', user ? `ログイン済み (${user.email})` : '未ログイン');
    this.currentUser = user;
    this.listeners.forEach(callback => callback(user));
  }

  // 認証状態をチェック
  async checkAuthState() {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._performAuthStateCheck();
    return this.initializationPromise;
  }

  async _performAuthStateCheck() {
    try {
      const user = await authClient.getCurrentUser();
      this.updateAuthState(user);
      this.isInitialized = true;
      return user;
    } catch (error) {
      console.error('認証状態チェックエラー:', error);
      this.updateAuthState(null);
      this.isInitialized = true;
      return null;
    }
  }

  // 初期化完了を待機
  async waitForInitialization() {
    if (this.isInitialized) {
      return this.currentUser;
    }
    
    return await this.checkAuthState();
  }

  // 認証状態を強制更新
  async forceUpdateAuthState() {
    try {
      const user = await authClient.getCurrentUser();
      this.updateAuthState(user);
      return user;
    } catch (error) {
      console.error('認証状態強制更新エラー:', error);
      this.updateAuthState(null);
      return null;
    }
  }
}

// グローバルインスタンスを作成
const authStateManager = new AuthStateManager();

// 初期化時に認証状態をチェック
authStateManager.checkAuthState();

export { authClient, authStateManager }; 