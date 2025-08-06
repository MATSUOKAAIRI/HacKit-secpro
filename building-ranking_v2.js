import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, doc, updateDoc, increment, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// --- ▼ ここからデバッグログ ▼ ---
console.log("【1】 building-ranking_v2.js が読み込まれました。");
// --- ▲ ここまでデバッグログ ▲ ---

const firebaseConfig = {
  apiKey: "AIzaSyDJ4wJ3YUbXFfvmQdsBVDyd8TZBfmIn3Eg",
  authDomain: "hackit-d394f.firebaseapp.com",
  projectId: "hackit-d394f",
  storageBucket: "hackit-d394f.firebasestorage.app",
  messagingSenderId: "73269710558",
  appId: "1:73269710558:web:97c3f0061dd8bc72ecbc4f",
  measurementId: "G-4MBQ6S9SDC"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const rankingSection = document.querySelector(".ranking");
const urlParams = new URLSearchParams(window.location.search);
const placeFilter = urlParams.get("place");
let currentUser = null;

// --- ▼ ここからデバッグログ ▼ ---
console.log("【2】 URLから取得した場所:", placeFilter);
// --- ▲ ここまでデバッグログ ▲ ---

async function fetchBuildingRankings(place, category) {
  // --- ▼ ここからデバッグログ ▼ ---
  console.log("【4】 fetchBuildingRankingsが実行されました。");
  console.log("    引数 Place:", place);
  console.log("    引数 Category:", category);
  // --- ▲ ここまでデバッグログ ▲ ---

  if (!place) {
    rankingSection.innerHTML = "<p>表示する建物を指定してください。</p>";
    return;
  }

  const q = query(collection(db, "opinion"), orderBy("empathy", "desc"));
  const querySnapshot = await getDocs(q);

  // --- ▼ ここからデバッグログ ▼ ---
  console.log(`【5】 Firestoreから ${querySnapshot.size} 件のデータを取得しました。`);
  // --- ▲ ここまでデバッグログ ▲ ---

  rankingSection.innerHTML = `<h2>📍 ${place} の不満ランキング</h2>`;

  let rank = 1;
  let displayedCount = 0; // フィルター後に表示された件数をカウント

  querySnapshot.forEach((docSnapshot) => {
    const data = docSnapshot.data();
    
    // 最初の1件だけ中身をログに出力してみる
    if (rank === 1 && displayedCount === 0) {
        // --- ▼ ここからデバッグログ ▼ ---
        console.log("【6】 取得した最初の1件のデータ内容:", data);
        // --- ▲ ここまでデバッグログ ▲ ---
    }
    
    // フィルター条件
    if (data.place !== place) return;
    if (category && data.category !== category) return;
    
    displayedCount++; // 表示件数をインクリメント

    const hasEmpathized = currentUser && data.empathizedUsers && data.empathizedUsers.includes(currentUser.uid);
    
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
          <span class="votes"><span class="empathy-count">${data.empathy}</span></span>
        </div>
      </div>
      <div class="instruction">↓詳細を表示</div>
    `;

    // 詳細表示のクリックイベント
    item.addEventListener("click", (e) => {
      if (e.target.closest(".empathy-btn")) return;
      const existing = item.querySelector(".details-inside");
      if (existing) {
        existing.remove();
        return;
      }
      const details = document.createElement("div");
      details.className = "details-inside";
      details.innerText = data.details;
      // 詳細表示のスタイル設定
      details.style.marginTop = "0.75em";
      details.style.padding = "0.8em";
      details.style.background = "#f9f9f9";
      details.style.borderRadius = "10px";
      details.style.boxShadow = "0 0 10px rgba(0,0,0,0.06)";
      details.style.lineHeight = "1.5";
      details.style.whiteSpace = "pre-wrap";
      details.style.width = "100%";
      details.style.boxSizing = "border-box";
      details.style.overflowWrap = "break-word";
      item.insertAdjacentElement('beforeend', details);
    });

    rankingSection.appendChild(item);

    // 共感ボタンの処理
    const empathyBtn = item.querySelector(".empathy-btn");
    if (!currentUser) {
      empathyBtn.disabled = true;
    } else if (hasEmpathized) {
      empathyBtn.textContent = "共感済み";
      empathyBtn.classList.add("empathized");
      empathyBtn.disabled = true;
    }

    empathyBtn.addEventListener("click", async () => {
      if (!currentUser || empathyBtn.classList.contains("empathized")) {
        alert(!currentUser ? "ログインが必要です" : "既に共感済みです");
        return;
      }

      try {
        const docRef = doc(db, "opinion", empathyBtn.dataset.id);
        await updateDoc(docRef, {
          empathy: increment(1),
          empathizedUsers: arrayUnion(currentUser.uid)
        });

        empathyBtn.textContent = "共感済み";
        empathyBtn.classList.add("empathized");
        empathyBtn.disabled = true;
        
        const countElem = item.querySelector(".empathy-count");
        countElem.textContent = parseInt(countElem.textContent) + 1;
      } catch (error) {
        console.error("共感エラー:", error);
        alert("共感の処理に失敗しました");
      }
    });
    
    rank++;
  });

  // --- ▼ ここからデバッグログ ▼ ---
  console.log(`【7】 フィルター後、${displayedCount} 件が表示されました。`);
  // --- ▲ ここまでデバッグログ ▲ ---

  if (displayedCount === 0) {
    rankingSection.innerHTML += `<p>この場所・カテゴリにはまだ投稿がありません。</p>`;
  }
}

document.getElementById("categoryFilter").addEventListener("change", (e) => {
  const selectedCategory = e.target.value;
  fetchBuildingRankings(placeFilter, selectedCategory);
});

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  
  // --- ▼ ここからデバッグログ ▼ ---
  console.log("【3】 認証状態が確認されました。 currentUser:", currentUser ? currentUser.uid : "未ログイン");
  // --- ▲ ここまでデバッグログ ▲ ---

  const initialCategory = document.getElementById("categoryFilter").value;
  fetchBuildingRankings(placeFilter, initialCategory);
});