// Firebase Authentication関数をインポート
import { onAuthStateChanged, getCurrentUser } from './firebase-config.js';

// 投稿ボタンの状態を更新する関数
function updatePostButtonForAuthState(user) {
    const postButton = document.querySelector('.post-button');
    
    if (postButton) {
        if (user) {
            // ログイン済みの場合
            postButton.textContent = '投稿';
            postButton.style.opacity = '1';
            postButton.style.pointerEvents = 'auto';
        } else {
            // 未ログインの場合
            postButton.textContent = '投稿';
            postButton.style.opacity = '1';
            postButton.style.pointerEvents = 'auto';
        }
    }
}

// 投稿ボタンの制御
async function setupPostButton() {
    const postButton = document.querySelector('.post-button');
    
    if (postButton) {
        // 既存のイベントリスナーを削除
        const newPostButton = postButton.cloneNode(true);
        postButton.parentNode.replaceChild(newPostButton, postButton);
        
        newPostButton.addEventListener('click', async function(e) {
            // 現在のユーザーを取得
            const currentUser = await getCurrentUser();
            
            if (!currentUser) {
                e.preventDefault(); // デフォルトのリンク動作を停止
                alert('ログインが必要です');
                window.location.href = 'login.html';
                return false;
            }
            
            // ログイン済みの場合は通常通り投稿ページに遷移
            return true;
        });
    }
}

// ページ読み込み時に投稿ボタンを設定
document.addEventListener('DOMContentLoaded', async function() {
    // 認証状態の変更を監視
    await onAuthStateChanged(function(user) {
        updatePostButtonForAuthState(user);
    });
    
    // 初期設定
    await setupPostButton();
    
    // 初期状態を設定
    const currentUser = await getCurrentUser();
    updatePostButtonForAuthState(currentUser);
}); 