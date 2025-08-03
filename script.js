import { authClient, authStateManager } from './auth-client.js';

let currentUser = null;

// 認証状態の監視を開始
function initializeAuth() {
  authStateManager.addListener((user) => {
    currentUser = user;
    console.log('script.js - 認証状態変更:', user ? `ログイン済み (${user.email})` : '未ログイン');
  });
}

const rankingSection = document.querySelector(".ranking");

// 認証状態の監視
async function initializeRankingApp() {
  try {
    // Firebase初期化は他のスクリプトで行われるため、ここではスキップ
    
    // 認証状態の監視を開始
    initializeAuth();
    
    // 初期化が完了するまで少し待機
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 現在のユーザーを取得
    const initialUser = await authClient.getCurrentUser();
    currentUser = initialUser;
    
    // ランキングを初期読み込み
    fetchRankings();
    
  } catch (error) {
    console.error('アプリケーション初期化でエラーが発生しました:', error);
  }
}

// 共感ボタンの状態を更新する関数
function updateEmpathyButton(button, hasEmpathized, empathyCount) {
  if (hasEmpathized) {
    button.textContent = "共感済み";
    button.classList.add("empathized");
    button.disabled = true;
  } else {
    button.textContent = "共感する";
    button.classList.remove("empathized");
    button.disabled = false;
  }
}

// ① fetchRankings関数の定義
async function fetchRankings(categoryFilter = "", placeFilter = "") {
  if (!rankingSection) {
    console.error('rankingSection要素が見つかりません');
    return;
  }
  
  try {
    // authClientを使用してFirestoreにアクセス
    const result = await authClient.getPosts();
    if (!result.success) {
      console.error('投稿取得エラー:', result.error);
      return;
    }
    
    const posts = result.posts;
    // 共感数でソート
    posts.sort((a, b) => (b.empathy || 0) - (a.empathy || 0));

    rankingSection.innerHTML = ""; // ← 前の表示を消す

    let rank = 1;
    let displayedCount = 0;
    
    posts.forEach((post) => {
      const data = post;
      const empathizedUsers = data.empathizedUsers || []; // 共感したユーザーIDの配列

      // ② フィルター条件に合わないものはスキップ
      if ((categoryFilter && data.category !== categoryFilter) ||
          (placeFilter && data.place !== placeFilter)) {
        return;
      }

      // 現在のユーザーが既に共感しているかチェック
      const hasEmpathized = currentUser && empathizedUsers.includes(currentUser.uid);

      // 以下ランキング表示部分はそのまま
      const item = document.createElement("div");
      item.className = "ranking-item";
      item.innerHTML = `
  <span class="rank">${rank}位</span>
  <div class="content">
    <p class="summary">${data.text}</p>
    <span class="category">#${data.category}</span>
    <span class="place">📍${data.place}</span>
    </div>
  <div class="votes-container">
    <button class="empathy-btn" data-id="${post.id}" ${!currentUser ? 'disabled' : ''}>
      ${!currentUser ? 'ログインが必要' : (hasEmpathized ? '共感済み' : '共感する')}
    </button>
    <span class="votes"><span class="empathy-count">${data.empathy}</span></span>
  </div>
`;

      rankingSection.appendChild(item);
      displayedCount++;

      const empathyBtn = item.querySelector(".empathy-btn");
      
      // ログインしていない場合はボタンを無効化
      if (!currentUser) {
        empathyBtn.disabled = true;
        empathyBtn.classList.add("disabled");
      } else if (hasEmpathized) {
        empathyBtn.classList.add("empathized");
        empathyBtn.disabled = true;
      }

      empathyBtn.addEventListener("click", async () => {
        if (!currentUser) {
          alert("ログインが必要です");
          return;
        }

        if (hasEmpathized) {
          alert("既に共感済みです");
          return;
        }

        try {
          const docRef = doc(db, "opinion", empathyBtn.dataset.id);
          await updateDoc(docRef, {
            empathy: increment(1),
            empathizedUsers: arrayUnion(currentUser.uid)
          });
          
          // ボタンの状態を更新
          empathyBtn.textContent = "共感済み";
          empathyBtn.classList.add("empathized");
          empathyBtn.disabled = true;
          
          // カウントを更新
          const empathyCountElem = item.querySelector(".empathy-count");
          const current = parseInt(empathyCountElem.textContent);
          empathyCountElem.textContent = current + 1;
          
        } catch (error) {
          console.error("共感エラー:", error);
          alert("共感の処理に失敗しました");
        }
      });

      rank++;
    });
    
    if (displayedCount === 0) {
      rankingSection.innerHTML = '<div class="no-data">まだ投稿がありません</div>';
    }
    
  } catch (error) {
    console.error('ランキング取得でエラーが発生しました:', error);
    rankingSection.innerHTML = '<div class="error">データの読み込みに失敗しました</div>';
  }
}

// ③ セレクトボックスにイベントを付ける（fetchRankingsを呼ぶ）
document.getElementById("categoryFilter").addEventListener("change", () => {
  const cat = document.getElementById("categoryFilter").value;
  const place = document.getElementById("placeFilter").value;
  fetchRankings(cat, place);
});

document.getElementById("placeFilter").addEventListener("change", () => {
  const cat = document.getElementById("categoryFilter").value;
  const place = document.getElementById("placeFilter").value;
  fetchRankings(cat, place);
});

// アプリケーションを初期化
initializeRankingApp();
