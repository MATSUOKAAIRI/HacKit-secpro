// Firebase Automation機能を活用したメインページ
import { authClient, authStateManager } from './auth-client.js';

let currentUser = null;
let posts = [];

// 認証状態の監視
async function initializeMainApp() {
  try {
    console.log('Firebase Automation機能で初期化を開始します...');
    
    // 認証状態を監視
    authStateManager.addListener((user) => {
      currentUser = user;
      console.log('認証状態が変更されました:', user ? 'ログイン済み' : '未ログイン');
      updateUI();
    });
    
    // 現在のユーザーを取得
    currentUser = await authClient.getCurrentUser();
    console.log('現在のユーザー:', currentUser);
    
    // 投稿を読み込み
    await loadPosts();
    
  } catch (error) {
    console.error('Firebase Automation初期化でエラーが発生しました:', error);
  }
}

// 投稿を読み込み
async function loadPosts() {
  try {
    console.log('Firestoreから投稿を読み込み中...');
    const result = await authClient.getPosts();
    
    if (result.success) {
      posts = result.posts;
      console.log('投稿を読み込みました:', posts.length + '件');
      displayPosts();
    } else {
      console.error('投稿読み込みエラー:', result.error);
    }
  } catch (error) {
    console.error('投稿読み込みエラー:', error);
  }
}

// 投稿を表示
function displayPosts() {
  const postsContainer = document.querySelector('.posts-container');
  if (!postsContainer) return;
  
  postsContainer.innerHTML = '';
  
  posts.forEach(post => {
    const postElement = document.createElement('div');
    postElement.className = 'post-item';
    postElement.innerHTML = `
      <h3>${post.title}</h3>
      <p>${post.details}</p>
      <div class="post-meta">
        <span class="category">${post.category}</span>
        <span class="place">${post.place}</span>
        <span class="empathy">👍 ${post.empathy || 0}</span>
      </div>
    `;
    postsContainer.appendChild(postElement);
  });
}

// UI更新
function updateUI() {
  const authLink = document.getElementById('auth-link');
  if (authLink) {
    if (currentUser) {
      authLink.textContent = 'ログアウト';
      authLink.href = '#';
      authLink.onclick = async (e) => {
        e.preventDefault();
        const result = await authClient.logout();
        if (result.success) {
          window.location.reload();
        }
      };
    } else {
      authLink.textContent = 'ログイン';
      authLink.href = 'login.html';
    }
  }
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('DOM読み込み完了、Firebase Automation初期化を開始...');
    
    // Firebase Automationを初期化
    await initializeMainApp();
    
    // UI更新
    updateUI();
    
  } catch (error) {
    console.error('アプリケーション初期化でエラーが発生しました:', error);
  }
});