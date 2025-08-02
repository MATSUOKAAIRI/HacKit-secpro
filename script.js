import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, doc, updateDoc, increment} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

const rankingSection = document.querySelector(".ranking");

// ① fetchRankings関数の定義
async function fetchRankings(categoryFilter = "", placeFilter = "") {
  const q = query(collection(db, "opinion"), orderBy("empathy", "desc"));
  const querySnapshot = await getDocs(q);

  rankingSection.innerHTML = ""; // ← 前の表示を消す

  let rank = 1;
  querySnapshot.forEach((docSnapshot) => {
    const data = docSnapshot.data();

    // ② フィルター条件に合わないものはスキップ
    if ((categoryFilter && data.category !== categoryFilter) ||
        (placeFilter && data.place !== placeFilter)) {
      return;
    }

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
    <button class="empathy-btn" data-id="${docSnapshot.id}"> 共感する</button>
    <span class="votes"><span class="empathy-count">${data.empathy}</span></span>
  </div>
`;

    rankingSection.appendChild(item);

    const empathyBtn = item.querySelector(".empathy-btn");
    empathyBtn.addEventListener("click", async () => {
      const docRef = doc(db, "opinion", empathyBtn.dataset.id);
      await updateDoc(docRef, {
        empathy: increment(1),
      });
      const empathyCountElem = item.querySelector(".empathy-count");
      const current = parseInt(empathyCountElem.textContent);
      empathyCountElem.textContent = current + 1;
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

// 初回読み込み
fetchRankings();
