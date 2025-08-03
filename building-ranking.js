import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
// Firestoreの更新に必要
import {
  doc,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


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
if (!placeFilter) {
  rankingSection.innerHTML = "<p>号館が指定されていません。</p>";
} else {
  fetchBuildingRankings(placeFilter);
}//placeFilterのチェック------------------------------------------------

async function fetchBuildingRankings(place) {
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
/*
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
  }*/

  rankingSection.appendChild(item);
  rank++;
});


  if (rank === 1) {
    rankingSection.innerHTML += `<p>この号館にはまだ投稿がありません。</p>`;
  }
}
