import { authClient, authStateManager } from './auth-client.js';

const rankingSection = document.querySelector(".ranking");

let currentUser = null;

// 認証状態の監視
authStateManager.addListener((user) => {
  currentUser = user;
  console.log('building-ranking.js - 認証状態変更:', user ? `ログイン済み (${user.email})` : '未ログイン');
});

// 共感した投稿のIDを取得
const getEmpathizedIds = () => {
  const ids = localStorage.getItem("empathizedIds");
  return ids ? JSON.parse(ids) : [];
};

// 共感した投稿のIDを追加
const addEmpathizedId = (id) => {
  const ids = getEmpathizedIds();
  ids.push(id);
  localStorage.setItem("empathizedIds", JSON.stringify(ids));
};

// URLパラメータから号館を取得
const urlParams = new URLSearchParams(window.location.search);
const placeFilter = urlParams.get('place');

if (!placeFilter) {
  rankingSection.innerHTML = "<p>号館が指定されていません。</p>";
} else {
  fetchBuildingRankings(placeFilter);
}

async function fetchBuildingRankings(place) {
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

  let rank = 1;
  rankingSection.innerHTML = `<h2>📍 ${place} の不満ランキング</h2>`;

posts.forEach((post) => {
  const data = post;
  const docId = post.id;

  if (data.place !== place) return;

  const isEmpathized = getEmpathizedIds().includes(docId);

  const item = document.createElement("div");
  item.className = "ranking-item";
  item.innerHTML = `
    <span class="rank">${rank}位</span>
    <div class="content">
      <p class="summary">${data.text}</p>
      <span class="category">#${data.category}</span>
    </div>
    <div class="votes-container">
      <span class="votes"><span class="empathy-count">${data.empathy}</span></span>
      <button class="empathy-btn ${isEmpathized ? 'empathized' : ''}" data-id="${docId}" ${isEmpathized ? "disabled" : ""}>
        👍 共感
      </button>
    </div>
  `;

  const button = item.querySelector(".empathy-btn");

  if (!isEmpathized) {
    button.addEventListener("click", async () => {
      try {
        // authClientを使用して共感を追加
        const result = await authClient.addEmpathy(docId);
        
        if (result.success) {
          const countSpan = item.querySelector(".empathy-count");
          countSpan.textContent = parseInt(countSpan.textContent) + 1;

          button.disabled = true;
          button.classList.add("empathized");
          addEmpathizedId(docId);
        } else {
          alert("共感の処理に失敗しました");
        }
      } catch (error) {
        console.error("共感エラー:", error);
        alert("共感の処理に失敗しました");
      }
    });
  }

  rankingSection.appendChild(item);
  rank++;
});

  if (rank === 1) {
    rankingSection.innerHTML +=
      '<div class="no-data">まだ投稿がありません</div>';
  }

} catch (error) {
  console.error('号館別ランキング取得エラー:', error);
  rankingSection.innerHTML = '<div class="error">データの読み込みに失敗しました</div>';
}
}
