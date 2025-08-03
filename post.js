// Firebase SDKを直接インポート
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let firebaseConfig = null;
let currentUser = null;
let db = null;
let auth = null;

// サーバーから環境変数を取得して設定を更新
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
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);       // 追加
  const auth = getAuth(app);           // 追加
  
  return { app, db, auth };
}


// 認証状態の監視
async function initializePostApp() {
  const firebaseApp = await loadFirebaseConfig();
  db = firebaseApp.db;
  auth = firebaseApp.auth;
  
  try {
    onAuthStateChanged(auth, (user) => {
      currentUser = user;
    });
  } catch (error) {
    console.error('認証状態の監視でエラーが発生しました:', error);
    // エラーが発生した場合は、現在のユーザー状態を取得
    currentUser = auth.currentUser;
  }
}

// フォーム送信処理
document.addEventListener("DOMContentLoaded", async () => {
  // Firebaseを初期化
  await initializePostApp();
  
  const form = document.querySelector("form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // ログイン状態チェック
    if (!currentUser) {
      alert("ログインが必要です");
      return;
    }

    const category = document.getElementById("type").value;
    const place = document.getElementById("building").value;
    const titleInput = document.getElementById("title");
    const title = titleInput.value.trim();
    const details = document.getElementById("details").value.trim();

    // タイトル文字数チェック
    if (title.length > 25) {
      alert("タイトルは25文字以内で入力してください。もう一度入力し直してください。");
      titleInput.focus(); // タイトル欄にフォーカスを戻す
      titleInput.select(); // 文字を選択状態にして再入力しやすくする
      return;
    }

    try {
      await addDoc(collection(db, "opinion"), {
        title,
        details,
        category,
        place,
        empathy: 0
      });

      alert("ご意見を受け付けました！");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
    } catch (error) {
      console.error("送信エラー:", error);
      alert("送信に失敗しました。もう一度お試しください。");
    }
  });
});