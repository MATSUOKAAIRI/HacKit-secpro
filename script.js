import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, doc, updateDoc, increment, arrayUnion, arrayRemove} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

let firebaseConfig = null;

// サーバーから環境変数を取得して設定を更新
async function loadFirebaseConfig() {
  const response = await fetch('/api/config');
  const config = await response.json();
  
  firebaseConfig = {
    apiKey: config.firebase.apiKey,
    authDomain: config.firebase.authDomain,
    projectId: config.firebase.projectId,
    storageBucket: config.firebase.storageBucket,
    messagingSenderId: config.firebase.messagingSenderId,
    appId: config.firebase.appId,
    measurementId: config.firebase.measurementId
  };
  
  // Firebaseを初期化
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);
  
  return { app, db, auth };
}

const rankingSection = document.querySelector(".ranking");

let currentUser = null;
let db = null;
let auth = null;

// 認証状態の監視
async function initializeApp() {
  const firebaseApp = await loadFirebaseConfig();
  db = firebaseApp.db;
  auth = firebaseApp.auth;
  
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    // ユーザー状態が変わったらランキングを再読み込み
    fetchRankings();
  });
  
  // 初回読み込み
  fetchRankings();
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
  if (!db) return; // Firebaseが初期化されていない場合は何もしない
  
  const q = query(collection(db, "opinion"), orderBy("empathy", "desc"));
  const querySnapshot = await getDocs(q);

  rankingSection.innerHTML = ""; // ← 前の表示を消す

  let rank = 1;
  querySnapshot.forEach((docSnapshot) => {
    const data = docSnapshot.data();
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
    <button class="empathy-btn" data-id="${docSnapshot.id}" ${!currentUser ? 'disabled' : ''}>
      ${!currentUser ? 'ログインが必要' : (hasEmpathized ? '共感済み' : '共感する')}
    </button>
    <span class="votes"><span class="empathy-count">${data.empathy}</span></span>
  </div>
`;

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
initializeApp();
