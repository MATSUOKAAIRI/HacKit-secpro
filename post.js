// Firebase設定と認証機能をインポート
import { onAuthStateChanged, getCurrentUser } from './firebase-config.js';
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let currentUser = null;
let db = null;

// 認証状態の監視
async function initializePostApp() {
  try {
    console.log('Firebase初期化を開始します...');
    
    // Firestoreを取得
    db = getFirestore();
    console.log('Firestore初期化完了');
    
    // 認証状態を監視
    onAuthStateChanged((user) => {
      currentUser = user;
      console.log('認証状態が変更されました:', user ? 'ログイン済み' : '未ログイン');
    });
    
    // 現在のユーザーを取得
    currentUser = await getCurrentUser();
    console.log('現在のユーザー:', currentUser);
    
  } catch (error) {
    console.error('Firebase初期化でエラーが発生しました:', error);
    alert('Firebaseの初期化に失敗しました。ページを再読み込みしてください。');
  }
}

// フォーム送信処理
document.addEventListener("DOMContentLoaded", async () => {
  try {
    console.log('DOM読み込み完了、Firebase初期化を開始...');
    
    // Firebaseを初期化
    await initializePostApp();
    
    const form = document.querySelector("form");
    console.log('フォーム要素を取得:', form);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log('フォーム送信が開始されました');

      // ログイン状態チェック
      if (!currentUser) {
        alert("ログインが必要です");
        window.location.href = "login.html";
        return;
      }

      const category = document.getElementById("type").value;
      const place = document.getElementById("building").value;
      const titleInput = document.getElementById("title");
      const title = titleInput.value.trim();
      const details = document.getElementById("details").value.trim();

      console.log('送信データ:', { category, place, title, details });

      // タイトル文字数チェック
      if (title.length > 25) {
        alert("タイトルは25文字以内で入力してください。もう一度入力し直してください。");
        titleInput.focus();
        titleInput.select();
        return;
      }

      try {
        console.log('Firestoreに投稿を追加中...');
        const docRef = await addDoc(collection(db, "opinion"), {
          title,
          details,
          category,
          place,
          empathy: 0,
          userId: currentUser.uid,
          createdAt: new Date()
        });

        console.log('投稿が成功しました:', docRef.id);
        alert("ご意見を受け付けました！");
        setTimeout(() => {
          window.location.href = "index.html";
        }, 2000);
      } catch (error) {
        console.error("送信エラー:", error);
        alert("送信に失敗しました。もう一度お試しください。");
      }
    });
  } catch (error) {
    console.error('アプリケーション初期化でエラーが発生しました:', error);
    alert('アプリケーションの初期化に失敗しました。ページを再読み込みしてください。');
  }
});