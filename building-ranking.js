import { authClient, authStateManager } from './auth-client.js';

const rankingSection = document.querySelector(".ranking");//rankingのclassにrankingSectionという変数を置く-----

// ページのクエリパラメータから「place」を取得----------------------------
const urlParams = new URLSearchParams(window.location.search);
const placeFilter = urlParams.get("place");

const getEmpathizedIds = () =>
  JSON.parse(localStorage.getItem("empathizedIds") || "[]");//共感済みかどうか

const addEmpathizedId = (id) => {
  const ids = getEmpathizedIds();
  ids.push(id);
  localStorage.setItem("empathizedIds", JSON.stringify(ids));
};//共感ボタンの管理

// Firebase初期化を待機
async function initializeFirebase() {
  try {
    await authClient.initializeFirebase();
    const db = await authClient.getFirestoreDB();
    return db;
  } catch (error) {
    console.error('Firebase初期化エラー:', error);
    throw error;
  }
}

if (!placeFilter) {
  rankingSection.innerHTML = "<p>号館が指定されていません。</p>";
} else {
  fetchBuildingRankings(placeFilter);
}//placeFilterのチェック------------------------------------------------

async function fetchBuildingRankings(place) {
  try {
    // Firebase初期化
    const db = await initializeFirebase();
    
    // Firestoreの関数をインポート
    const { getFirestore, collection, getDocs, query, orderBy } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    
    const q = query(collection(db, "opinion"), orderBy("empathy", "desc"));
    const querySnapshot = await getDocs(q);//クエリを作っている-----------------------

    let rank = 1;//順位を付ける最後のrank++で順番にランクづけられてる----------------
    rankingSection.innerHTML = `<h2>📍 ${place} の不満ランキング</h2>`;//rankingにh2を書く

    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      const docId = docSnapshot.id;

      if (data.place !== place) return;//あってなければスキップ---

      const isEmpathized = getEmpathizedIds().includes(docId);//共感済みかどうか

      const item = document.createElement("div");
      item.className = "ranking-item";
      item.innerHTML = `
        <span class="rank">${rank}位</span>
        <div class="content">
          <p class="summary">${data.title}</p>
          <span class="category">#${data.category}</span>
          <span class="place">📍${data.place}</span>
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
