import { authClient, authStateManager } from './auth-client.js';

const rankingSection = document.querySelector(".ranking");

// ページのクエリパラメータから「place」を取得----------------------------
const urlParams = new URLSearchParams(window.location.search);
const placeFilter = urlParams.get("place");
console.log("placeFilter:", placeFilter);

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

fetchBuildingRankings(placeFilter);
//placeFilterのチェック------

async function fetchBuildingRankings(place) {
  try {
    // Firebase初期化
    const db = await initializeFirebase();
    
    // Firestoreの関数をインポート
    const { getFirestore, collection, getDocs, query, orderBy } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    
    const q = query(collection(db, "opinion"), orderBy("empathy", "desc"));
    const querySnapshot = await getDocs(q);
    console.log("取得件数:", querySnapshot.size);
    // ここで値が0なら、コレクションが空かフィルターで除外されている
  } catch (error) {
    console.error("Firestore取得エラー:", error);
  }//クエリを作っている---------------

  rankingSection.innerHTML = `<h2>📍 ${place} の不満ランキング</h2>`;//rankingにh2を書く

  let currentUser = null;

  // 認証状態の監視
  authStateManager.addListener((user) => {
    currentUser = user;
    console.log('building-ranking_v2.js - 認証状態変更:', user ? `ログイン済み (${user.email})` : '未ログイン');
    // ユーザー状態が変わったらランキングを再読み込み
    fetchRankings(place, document.getElementById("categoryFilter")?.value, currentUser);
  });

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
  async function fetchRankings(place, categoryFilter = "", currentUser) { 
    try {
      const db = await initializeFirebase();
      const { collection, getDocs, query, orderBy } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      
      const q = query(collection(db, "opinion"), orderBy("empathy", "desc"));
      const querySnapshot = await getDocs(q);

      let rank = 1;
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const empathizedUsers = data.empathizedUsers || []; // 共感したユーザーIDの配列

        if (data.place !== place) return;//あってなければスキップ---

        // 現在のユーザーが既に共感しているかチェック
        const hasEmpathized = currentUser && empathizedUsers.includes(currentUser.uid);

        // 以下ランキング表示部分はそのまま
        const item = document.createElement("div");
        item.className = "ranking-item";

        // HTML構築（テンプレートリテラル）
        item.innerHTML = `
        <div class="overview">
          <span class="rank">${rank}位</span>
          <div class="content">
            <p class="summary">${data.title}</p>
            <div class="meta">
              <span class="category">#${data.category}</span>
              <span class="place">📍${data.place}</span>
            </div>
          </div>
          <div class="votes-container">
            <button class="empathy-btn" data-id="${docSnapshot.id}" ${!currentUser ? 'disabled' : ''}>
              ${!currentUser ? 'ログインが必要' : (hasEmpathized ? '共感済み' : '共感する')}
            </button>
            <span class="votes"><span class="empathy-count">${data.empathy || 0}</span></span>
          </div>
        </div>
        <div class="instruction">↓詳細を表示</div>
        `;

        // 共感ボタンのイベントリスナー
        const empathyBtn = item.querySelector(".empathy-btn");
        if (currentUser && !hasEmpathized) {
          empathyBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            try {
              // authClientを使用して共感を追加
              const result = await authClient.addEmpathy(docSnapshot.id);
              
              if (result.success) {
                const countSpan = item.querySelector(".empathy-count");
                countSpan.textContent = parseInt(countSpan.textContent) + 1;
                updateEmpathyButton(empathyBtn, true, data.empathy + 1);
              } else {
                alert("共感の処理に失敗しました");
              }
            } catch (error) {
              console.error("共感エラー:", error);
              alert("共感の処理に失敗しました");
            }
          });
        }

        item.addEventListener("click", (e) => {
          if (e.target.closest(".empathy-btn")) return;

          const content = item.querySelector(".content");

          // すでに表示中の詳細要素がある場合は削除
          const existing = item.querySelector(".details-inside");
          if (existing) {
            existing.remove();
            return; // 再クリックで閉じる
          }

          // 内部に表示する詳細要素を作成
          const details = document.createElement("div");
          details.className = "details-inside";
          details.innerText = data.details;

          // スタイルを付ける（ここでCSSでも可能）
          details.style.cssText = `
            background: #f5f5f5;
            padding: 15px;
            margin-top: 10px;
            border-radius: 5px;
            border-left: 4px solid #007bff;
            font-size: 14px;
            line-height: 1.6;
            color: #333;
          `;

          content.appendChild(details);
        });

        rankingSection.appendChild(item);
        rank++;
      });

      if (rank === 1) {
        rankingSection.innerHTML += '<div class="no-data">まだ投稿がありません</div>';
      }

    } catch (error) {
      console.error('号館別ランキング取得エラー:', error);
      rankingSection.innerHTML = '<div class="error">データの読み込みに失敗しました</div>';
    }
  }

  // 初期表示
  await fetchRankings(place, "", null);
}


