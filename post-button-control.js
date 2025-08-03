// Firebase Authentication関数をインポート
import { onAuthStateChanged, getCurrentUser } from './firebase-config.js';

// 投稿ボタンの制御
function setupPostButton() {
    const postButton = document.querySelector('.post-button');
    
    if (postButton) {
        // 既存のイベントリスナーを削除
        const newPostButton = postButton.cloneNode(true);
        postButton.parentNode.replaceChild(newPostButton, postButton);
        
        newPostButton.addEventListener('click', function(e) {
            // 現在のユーザーを取得
            const currentUser = getCurrentUser();
            
            if (!currentUser) {
                e.preventDefault(); // デフォルトのリンク動作を停止
                alert('ログインが必要です');
                return false;
            }
            
            // ログイン済みの場合は通常通り投稿ページに遷移
            return true;
        });
    }
}

// ページ読み込み時に投稿ボタンを設定
document.addEventListener('DOMContentLoaded', function() {
    // 初期設定のみ実行（認証状態の変更時には再設定しない）
    setupPostButton();
}); 