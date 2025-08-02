import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

console.log("hoge")

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

async function fetchRankings() {
  const q = query(collection(db, "opinion"), orderBy("empathy", "desc"));
  const querySnapshot = await getDocs(q);

  let rank = 1;
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    console.log(data)
    const item = document.createElement("div");
    item.className = "ranking-item";
    item.innerHTML = `
      <span class="rank">${rank}位</span>
      <div class="content">
        <p class="summary">${data.text}</p>
        <span class="category">#${data.category}</span>
        <span class="place">📍${data.place}</span>
        <span class="votes">👍 ${data.empathy}</span>
      </div>
    `;
    rankingSection.appendChild(item);
    rank++;
  });
}

fetchRankings();
