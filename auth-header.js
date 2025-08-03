// Firebase Automation機能を活用したヘッダー管理
import { authClient, authStateManager } from './auth-client.js';

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
            postButton.style.opacity = '0.7';
            postButton.style.pointerEvents = 'auto';
        }
    }
}

// 認証状態に応じてヘッダーを更新する関数
function updateHeaderForAuthState(user) {
    const authMenuItem = document.getElementById('auth-menu-item');
    const authLink = document.getElementById('auth-link');
    
    if (user) {
        // ログイン済みの場合
        authMenuItem.innerHTML = `
            <div class="user-menu">
                <div class="user-actions">
                    <span class="user-email">${user.email}</span>
                    <a href="password-change.html" class="password-change-link">パスワード変更</a>
                    <a href="#" id="logout-link" class="logout-link">ログアウト</a>
                </div>
            </div>
        `;
        
        // ログアウトリンクのイベントリスナーを追加
        const logoutLink = document.getElementById('logout-link');
        if (logoutLink) {
            logoutLink.addEventListener('click', async (e) => {
                e.preventDefault();
                
                // 確認ダイアログを表示
                const confirmed = confirm('ログアウトしますか？');
                if (!confirmed) {
                    return;
                }
                
                try {
                    const result = await authClient.logout();
                    if (result.success) {
                        alert('ログアウトしました');
                        // 認証状態を更新
                        authStateManager.updateAuthState(null);
                        window.location.reload();
                    } else {
                        alert('ログアウトに失敗しました');
                    }
                } catch (error) {
                    console.error('ログアウトエラー:', error);
                    alert('ログアウトに失敗しました');
                }
            });
        }
    } else {
        // 未ログインの場合
        authMenuItem.innerHTML = `
            <a href="login.html" id="auth-link">ログイン</a>
        `;
    }
}

// 認証状態が変更された時の処理
function handleAuthStateChange(user) {
    console.log('認証状態変更:', user ? `ログイン済み (${user.email})` : '未ログイン');
    updateHeaderForAuthState(user);
    updatePostButtonForAuthState(user);
}

// ページ読み込み時に認証状態を確認
document.addEventListener('DOMContentLoaded', async function() {
    try {
        console.log('ヘッダー認証状態監視を開始...');
        
        // Firebase初期化は他のスクリプトで行われるため、ここではスキップ
        
        // 認証状態の変更を監視
        authStateManager.addListener(function(user) {
            console.log('ヘッダー認証状態変更:', user ? 'ログイン済み' : '未ログイン');
            handleAuthStateChange(user);
        });
        
        // 初期状態を設定
        const currentUser = await authStateManager.waitForInitialization();
        console.log('ヘッダー初期ユーザー:', currentUser);
        handleAuthStateChange(currentUser);
        
    } catch (error) {
        console.error('ヘッダー認証状態監視エラー:', error);
    }
}); 