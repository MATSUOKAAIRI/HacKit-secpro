// Firebase Automation機能を活用した投稿ページ
import { authClient, authStateManager } from './auth-client.js';

let currentUser = null;

// 認証状態の監視
async function initializePostApp() {
  try {
    console.log('投稿ページの初期化を開始します...');
    
    // Firebaseを初期化
    await authClient.initializeFirebase();
    
    // 認証状態を監視
    authStateManager.addListener((user) => {
      currentUser = user;
      console.log('認証状態が変更されました:', user ? 'ログイン済み' : '未ログイン');
    });
    
    // 現在のユーザーを取得
    currentUser = await authClient.getCurrentUser();
    console.log('現在のユーザー:', currentUser);
    
  } catch (error) {
    console.error('投稿ページ初期化でエラーが発生しました:', error);
    alert('投稿ページの初期化に失敗しました。ページを再読み込みしてください。');
  }
}

// フォーム送信処理
document.addEventListener("DOMContentLoaded", async () => {
  try {
    console.log('DOM読み込み完了、投稿ページ初期化を開始...');
    
    // 投稿ページを初期化
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
        console.log('Firestoreに直接投稿を送信中...');
        const result = await authClient.createPost({
          title,
          details,
          category,
          place
        });

        if (result.success) {
          console.log('投稿が成功しました:', result.postId);
          alert("ご意見を受け付けました！");
          setTimeout(() => {
            window.location.href = "index.html";
          }, 2000);
        } else {
          console.error("投稿エラー:", result.error);
          alert("送信に失敗しました: " + result.error);
        }
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