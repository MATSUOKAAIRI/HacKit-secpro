// Firebase Automation機能を活用した投稿ボタン制御
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
            postButton.style.opacity = '1';
            postButton.style.pointerEvents = 'auto';
        }
    }
}

// 投稿ボタンの制御
async function setupPostButton() {
    const postButton = document.querySelector('.post-button');
    
    if (postButton) {
        console.log('投稿ボタンが見つかりました:', postButton);
        
        // 既存のイベントリスナーを削除
        const newPostButton = postButton.cloneNode(true);
        postButton.parentNode.replaceChild(newPostButton, postButton);
        
        // 新しいボタンにイベントリスナーを追加
        newPostButton.addEventListener('click', async function(e) {
            console.log('投稿ボタンがクリックされました');
            e.preventDefault(); // 常にデフォルトのリンク動作を停止
            e.stopPropagation(); // イベントの伝播を停止
            e.stopImmediatePropagation(); // 他のイベントリスナーも停止
            
            try {
                // 現在のユーザーを取得
                const currentUser = await authClient.getCurrentUser();
                console.log('現在のユーザー:', currentUser);
                
                if (!currentUser) {
                    console.log('ログインが必要です');
                    alert('ログインが必要です');
                    window.location.href = 'login.html';
                    return false;
                }
                
                // ログイン済みの場合は投稿ページに遷移
                console.log('投稿ページに遷移します');
                window.location.href = 'post.html';
                return false;
            } catch (error) {
                console.error('投稿ボタンクリック処理エラー:', error);
                alert('エラーが発生しました: ' + error.message);
                return false;
            }
        });
        
        console.log('投稿ボタンのイベントリスナーが設定されました');
    } else {
        console.error('投稿ボタンが見つかりません');
    }
}

// ページ読み込み時に投稿ボタンを設定
document.addEventListener('DOMContentLoaded', async function() {
    try {
        console.log('投稿ボタン認証状態監視を開始...');
        
        // 少し待機してから初期化（他のスクリプトとの競合を避ける）
        setTimeout(async () => {
            try {
                // 投稿ボタンの設定を最初に行う
                await setupPostButton();
                
                // 認証状態の変更を監視
                authStateManager.addListener(function(user) {
                    console.log('投稿ボタン認証状態変更:', user ? 'ログイン済み' : '未ログイン');
                    updatePostButtonForAuthState(user);
                });
                
                // 初期状態を設定
                const currentUser = await authClient.getCurrentUser();
                console.log('投稿ボタン初期ユーザー:', currentUser);
                updatePostButtonForAuthState(currentUser);
                
            } catch (error) {
                console.error('投稿ボタン初期化エラー:', error);
            }
        }, 500);
        
    } catch (error) {
        console.error('投稿ボタン認証状態監視エラー:', error);
    }
}); 