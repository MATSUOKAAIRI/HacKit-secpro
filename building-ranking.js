import { authClient } from './auth-client.js';

const rankingSection = document.querySelector(".ranking");

// ページのクエリパラメータから「place」を取得
const urlParams = new URLSearchParams(window.location.search);
const placeFilter = urlParams.get("place");

// place が指定されていない場合は何もしない
const getEmpathizedIds = () =>
  JSON.parse(localStorage.getItem("empathizedIds") || "[]");

const addEmpathizedId = (id) => {
  const ids = getEmpathizedIds();
  ids.push(id);
  localStorage.setItem("empathizedIds", JSON.stringify(ids));
};
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
      const ref = doc(db, "opinion", docId);
      await updateDoc(ref, {
        empathy: increment(1)
      });

      const countSpan = item.querySelector(".empathy-count");
      countSpan.textContent = parseInt(countSpan.textContent) + 1;

      button.disabled = true;
      button.classList.add("empathized");
      addEmpathizedId(docId);
    });
  }

  rankingSection.appendChild(item);
  rank++;
});


  if (rank === 1) {
    rankingSection.innerHTML += `<p>この号館にはまだ投稿がありません。</p>`;
  }
  } catch (error) {
    console.error('ランキング取得エラー:', error);
  }
}
