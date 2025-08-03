// Firebase Authentication関数をインポート
import { onAuthStateChanged, signOut, getCurrentUser } from './firebase-config.js';

// 認証状態に応じてヘッダーを更新する関数
function updateHeaderForAuthState(user) {
    const authMenuItem = document.getElementById('auth-menu-item');
    const authLink = document.getElementById('auth-link');
    
    if (user) {
        // ログイン済みの場合
        authMenuItem.innerHTML = `
            <div class="user-menu">
                <div class="user-actions">
                    <a href="password-change.html" class="password-change-link">パスワード変更</a>
                    <a href="#" id="logout-link" class="logout-link">ログアウト</a>
                </div>
            </div>
        `;
        
        // ログアウトリンクのイベントリスナーを追加
        const logoutLink = document.getElementById('logout-link');
        logoutLink.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // 確認ダイアログを表示
            const confirmed = confirm('ログアウトしますか？');
            if (!confirmed) {
                return;
            }
            
            try {
                const result = await signOut();
                if (result.success) {
                    alert('ログアウトしました');
                    window.location.reload();
                } else {
                    alert('ログアウトに失敗しました');
                }
            } catch (error) {
                console.error('ログアウトエラー:', error);
                alert('ログアウトに失敗しました');
            }
        });
    } else {
        // 未ログインの場合
        authMenuItem.innerHTML = `
            <a href="login.html" id="auth-link">ログイン</a>
        `;
    }
}


// 認証状態が変更された時の処理
function handleAuthStateChange(user) {
    updateHeaderForAuthState(user);
    updatePostButtonForAuthState(user);
}

// ページ読み込み時に認証状態を確認
document.addEventListener('DOMContentLoaded', async function() {
    // 認証状態の変更を監視
    await onAuthStateChanged(function(user) {
        handleAuthStateChange(user);
    });
    
    // 初期状態を設定
    const currentUser = await getCurrentUser();
    handleAuthStateChange(currentUser);
}); 