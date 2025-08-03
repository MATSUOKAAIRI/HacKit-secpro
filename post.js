// Firebase SDKの読み込み（HTML側で読み込んでいる前提）
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";

let firebaseConfig = null;

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
  const db = getFirestore(app);
  const auth = getAuth(app);
  
  return { app, db, auth };
}

let currentUser = null;
let db = null;
let auth = null;

// 認証状態の監視
async function initializeApp() {
  const firebaseApp = await loadFirebaseConfig();
  db = firebaseApp.db;
  auth = firebaseApp.auth;
  
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
  });
}

// フォーム送信処理
document.addEventListener("DOMContentLoaded", async () => {
  // Firebaseを初期化
  await initializeApp();
  
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
    const text = document.getElementById("opinion").value;

    try {
      await addDoc(collection(db, "opinion"), {
        text,
        category,
        place: place,
        empathy:0
      });
// メッセージ表示
      alert("不満を受け付けたよ！");

      // 2秒後にメインページへ遷移（例：index.html）
      setTimeout(() => {
        window.location.href = "index.html"; // 遷移先を必要に応じて変更
      }, 2000);
    } catch (error) {
      console.error("送信エラー:", error);
      alert("送信に失敗しました。もう一度お試しください。");
    }
  });
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

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