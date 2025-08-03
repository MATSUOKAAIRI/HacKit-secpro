import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, doc, updateDoc, increment, arrayUnion, arrayRemove} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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

// ページのクエリパラメータから「place」を取得----------------------------
const urlParams = new URLSearchParams(window.location.search);
const placeFilter = urlParams.get("place");

if (!placeFilter) {
  rankingSection.innerHTML = "<p>号館が指定されていません。</p>";
} else {
  fetchBuildingRankings(placeFilter);
}//placeFilterのチェック------

async function fetchBuildingRankings(place) {
  const q = query(collection(db, "opinion"), orderBy("empathy", "desc"));
  const querySnapshot = await getDocs(q);//クエリを作っている---------------

    rankingSection.innerHTML = `<h2>📍 ${place} の不満ランキング</h2>`;//rankingにh2を書く


let currentUser = null;

// 認証状態の監視
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  // ユーザー状態が変わったらランキングを再読み込み
  fetchRankings();
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
async function fetchRankings(categoryFilter = "") {
  const q = query(collection(db, "opinion"), orderBy("empathy", "desc"));
  const querySnapshot = await getDocs(q);


  let rank = 1;
  querySnapshot.forEach((docSnapshot) => {
    const data = docSnapshot.data();
    const empathizedUsers = data.empathizedUsers || []; // 共感したユーザーIDの配列

        if (data.place !== place) return;//あってなければスキップ---

    // ② フィルター条件に合わないものはスキップ
    if (categoryFilter && data.category !== categoryFilter) {
      return;
    }

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
    <span class="votes"><span class="empathy-count">${data.empathy}</span></span>
  </div>
</div>
<div class="instruction">↓詳細を表示</div>
`;

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

  // .ranking-itemの直後に挿入
  item.insertAdjacentElement('beforeend', details);
});



    rankingSection.appendChild(item);

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
    if (rank === 1) {
    rankingSection.innerHTML += `<p>この号館にはまだ投稿がありません。</p>`;
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
}

