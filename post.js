// Firebase SDKの読み込み（HTML側で読み込んでいる前提）
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";

// Firebase設定（自分のプロジェクトの設定に置き換えてください）
const firebaseConfig = {
  apiKey: "AIzaSyDJ4wJ3YUbXFfvmQdsBVDyd8TZBfmIn3Eg",
  authDomain: "hackit-d394f.firebaseapp.com",
  projectId: "hackit-d394f",
  storageBucket: "hackit-d394f.firebasestorage.app",
  messagingSenderId: "73269710558",
  appId: "1:73269710558:web:97c3f0061dd8bc72ecbc4f",
  measurementId: "G-4MBQ6S9SDC"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null;

// 認証状態の監視
onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

// フォーム送信処理
document.addEventListener("DOMContentLoaded", () => {
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
        empathy: 0,
        empathizedUsers: []
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
