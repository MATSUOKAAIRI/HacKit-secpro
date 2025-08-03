import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

// ページのクエリパラメータから「place」を取得
const urlParams = new URLSearchParams(window.location.search);
const placeFilter = urlParams.get("place");

// place が指定されていない場合は何もしない
if (!placeFilter) {
  rankingSection.innerHTML = "<p>号館が指定されていません。</p>";
} else {
  fetchBuildingRankings(placeFilter);
}

async function fetchBuildingRankings(place) {
  const q = query(collection(db, "opinion"), orderBy("empathy", "desc"));
  const querySnapshot = await getDocs(q);

  let rank = 1;
  rankingSection.innerHTML = `<h2>📍 ${place} の不満ランキング</h2>`;

  querySnapshot.forEach((docSnapshot) => {
    const data = docSnapshot.data();
    if (data.place !== place) return;

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
      </div>
    `;

    rankingSection.appendChild(item);
    rank++;
  });

  if (rank === 1) {
    rankingSection.innerHTML += `<p>この号館にはまだ投稿がありません。</p>`;
  }
}
