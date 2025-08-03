import { getFirestore, collection, getDocs, query, orderBy, doc, updateDoc, increment, arrayUnion, arrayRemove} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged as firebaseOnAuthStateChanged, getCurrentUser, initializeApp, getAuth } from './firebase-config.js';

let firebaseConfig = null;
let db = null;
let auth = null;
let currentUser = null;

// Firebase設定を直接設定
function loadFirebaseConfig() {
  // 環境変数の確認
  console.log('script.js - Firebase環境変数の確認:');
  console.log('FIREBASE_API_KEY:', window.FIREBASE_API_KEY ? '設定済み' : '未設定');
  console.log('FIREBASE_AUTH_DOMAIN:', window.FIREBASE_AUTH_DOMAIN ? '設定済み' : '未設定');
  console.log('FIREBASE_PROJECT_ID:', window.FIREBASE_PROJECT_ID ? '設定済み' : '未設定');
  
  // テンプレート変数がそのまま表示されているかチェック
  const hasTemplateVariables = 
    window.FIREBASE_API_KEY === '{{ FIREBASE_API_KEY }}' ||
    window.FIREBASE_AUTH_DOMAIN === '{{ FIREBASE_AUTH_DOMAIN }}' ||
    window.FIREBASE_PROJECT_ID === '{{ FIREBASE_PROJECT_ID }}';
  
  if (hasTemplateVariables) {
    console.warn('script.js - 環境変数がテンプレート変数のままです。デフォルト設定を使用します。');
    
    // 本番環境でもデフォルト設定を使用
    firebaseConfig = {
      apiKey: "AIzaSyDJ4wJ3YUbXFfvmQdsBVDyd8TZBfmIn3Eg",
      authDomain: "hackit-d394f.firebaseapp.com",
      projectId: "hackit-d394f",
      storageBucket: "hackit-d394f.firebasestorage.app",
      messagingSenderId: "73269710558",
      appId: "1:73269710558:web:97c3f0061dd8bc72ecbc4f",
      measurementId: "G-4MBQ6S9SDC"
    };
  } else {
    // 環境変数から設定を取得
    firebaseConfig = {
      apiKey: window.FIREBASE_API_KEY,
      authDomain: window.FIREBASE_AUTH_DOMAIN,
      projectId: window.FIREBASE_PROJECT_ID,
      storageBucket: window.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: window.FIREBASE_MESSAGING_SENDER_ID,
      appId: window.FIREBASE_APP_ID,
      measurementId: window.FIREBASE_MEASUREMENT_ID
    };
    
    // 必須設定の検証
    if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
      console.error('script.js - Firebase設定が不完全です。デフォルト設定を使用します。');
      
      firebaseConfig = {
        apiKey: "AIzaSyDJ4wJ3YUbXFfvmQdsBVDyd8TZBfmIn3Eg",
        authDomain: "hackit-d394f.firebaseapp.com",
        projectId: "hackit-d394f",
        storageBucket: "hackit-d394f.firebasestorage.app",
        messagingSenderId: "73269710558",
        appId: "1:73269710558:web:97c3f0061dd8bc72ecbc4f",
        measurementId: "G-4MBQ6S9SDC"
      };
    }
  }
  
  console.log('script.js - Firebase設定:', firebaseConfig);
  
  // Firebaseを初期化
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);
  
  return { app, db, auth };
}

const rankingSection = document.querySelector(".ranking");

// 認証状態の監視
async function initializeRankingApp() {
  try {
    const firebaseApp = loadFirebaseConfig();
    db = firebaseApp.db;
    auth = firebaseApp.auth;
    
    // 初期化が完了するまで少し待機
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 現在のユーザーを取得
    const initialUser = auth.currentUser;
    currentUser = initialUser;
    
    // 認証状態の監視を開始
    try {
      const authCallback = (user) => {
        currentUser = user;
        // ユーザー状態が変わったらランキングを再読み込み
        fetchRankings();
      };
      
      // コールバック関数の検証
      if (typeof authCallback === 'function') {
        firebaseOnAuthStateChanged(auth, authCallback);
      } else {
        console.error('認証コールバックが関数ではありません');
      }
    } catch (error) {
      console.error('認証状態の監視でエラーが発生しました:', error);
    }
    
    // 初回読み込み
    await fetchRankings();
  } catch (error) {
    console.error('アプリケーション初期化でエラーが発生しました:', error);
  }
}

// 共感ボタンの状態を更新する関数
function updateEmpathyButton(button, hasEmpathized, empathyCount) {
  if (hasEmpathized) {
    button.textContent = "共感済み";
    button.classList.add("empathized");
    button.disabled = true;
  } else {
    button.textContent = "共感する";
    button.classList.remove("empathized");
    button.disabled = false;
  }
}

// ① fetchRankings関数の定義
async function fetchRankings(categoryFilter = "", placeFilter = "") {
  if (!db) {
    console.error('Firebaseが初期化されていません');
    return;
  }
  
  if (!rankingSection) {
    console.error('rankingSection要素が見つかりません');
    return;
  }
  
  try {
    const q = query(collection(db, "opinion"), orderBy("empathy", "desc"));
    const querySnapshot = await getDocs(q);

    rankingSection.innerHTML = ""; // ← 前の表示を消す

    let rank = 1;
    let displayedCount = 0;
    
    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      const empathizedUsers = data.empathizedUsers || []; // 共感したユーザーIDの配列

      // ② フィルター条件に合わないものはスキップ
      if ((categoryFilter && data.category !== categoryFilter) ||
          (placeFilter && data.place !== placeFilter)) {
        return;
      }

      // 現在のユーザーが既に共感しているかチェック
      const hasEmpathized = currentUser && empathizedUsers.includes(currentUser.uid);

      // 以下ランキング表示部分はそのまま
      const item = document.createElement("div");
      item.className = "ranking-item";
      item.innerHTML = `
  <span class="rank">${rank}位</span>
  <div class="content">
    <p class="summary">${data.text}</p>
    <span class="category">#${data.category}</span>
    <span class="place">📍${data.place}</span>
    </div>
  <div class="votes-container">
    <button class="empathy-btn" data-id="${docSnapshot.id}" ${!currentUser ? 'disabled' : ''}>
      ${!currentUser ? 'ログインが必要' : (hasEmpathized ? '共感済み' : '共感する')}
    </button>
    <span class="votes"><span class="empathy-count">${data.empathy}</span></span>
  </div>
`;

      rankingSection.appendChild(item);
      displayedCount++;

      const empathyBtn = item.querySelector(".empathy-btn");
      
      // ログインしていない場合はボタンを無効化
      if (!currentUser) {
        empathyBtn.disabled = true;
        empathyBtn.classList.add("disabled");
      } else if (hasEmpathized) {
        empathyBtn.classList.add("empathized");
        empathyBtn.disabled = true;
      }

      empathyBtn.addEventListener("click", async () => {
        if (!currentUser) {
          alert("ログインが必要です");
          return;
        }

        if (hasEmpathized) {
          alert("既に共感済みです");
          return;
        }

        try {
          const docRef = doc(db, "opinion", empathyBtn.dataset.id);
          await updateDoc(docRef, {
            empathy: increment(1),
            empathizedUsers: arrayUnion(currentUser.uid)
          });
          
          // ボタンの状態を更新
          empathyBtn.textContent = "共感済み";
          empathyBtn.classList.add("empathized");
          empathyBtn.disabled = true;
          
          // カウントを更新
          const empathyCountElem = item.querySelector(".empathy-count");
          const current = parseInt(empathyCountElem.textContent);
          empathyCountElem.textContent = current + 1;
          
        } catch (error) {
          console.error("共感エラー:", error);
          alert("共感の処理に失敗しました");
        }
      });

      rank++;
    });
    
    if (displayedCount === 0) {
      rankingSection.innerHTML = '<div class="no-data">まだ投稿がありません</div>';
    }
    
  } catch (error) {
    console.error('ランキング取得でエラーが発生しました:', error);
    rankingSection.innerHTML = '<div class="error">データの読み込みに失敗しました</div>';
  }
}

// ③ セレクトボックスにイベントを付ける（fetchRankingsを呼ぶ）
document.getElementById("categoryFilter").addEventListener("change", () => {
  const cat = document.getElementById("categoryFilter").value;
  const place = document.getElementById("placeFilter").value;
  fetchRankings(cat, place);
});

document.getElementById("placeFilter").addEventListener("change", () => {
  const cat = document.getElementById("categoryFilter").value;
  const place = document.getElementById("placeFilter").value;
  fetchRankings(cat, place);
});

// アプリケーションを初期化
initializeRankingApp();
