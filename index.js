document.addEventListener('DOMContentLoaded', () => {
    // Get all the clickable <area> elements
    const areas = document.querySelectorAll('map[name="campus-map"] area');

    // Add mouseover and mouseout events to each area
    areas.forEach(area => {
        // When the mouse enters an area
        area.addEventListener('mouseover', () => {
            const pinId = area.dataset.pinId; // Get the pin's ID from the data attribute
            if (pinId) {
                const pin = document.getElementById(pinId);
                if (pin) {
                    pin.classList.add('is-visible'); // Make the corresponding pin visible
                }
            }
        });

        // When the mouse leaves an area
        area.addEventListener('mouseout', () => {
            const pinId = area.dataset.pinId;
            if (pinId) {
                const pin = document.getElementById(pinId);
                if (pin) {
                    pin.classList.remove('is-visible'); // Hide the pin again
                }
            }
        });
    });
});

// firebase-config.js から初期化済みの db をインポート
import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// --- DOM要素の取得 ---
const categoryButtons = document.querySelectorAll('.category-filters .category-button');

/**
 * Firestoreからデータを取得し、スコアを計算してヒートマップを更新するメイン関数
 * @param {string} category - 表示するカテゴリ名 ('all' または '施設/設備' など)
 */
async function updateHeatmap(category = 'all') {
    try {
        // const locationsRef = collection(db, "opinion");
        // console.log("test db!!!!!!!!")
        // const querySnapshot = await getDocs(locationsRef);

        const querySnapshot = await db.collection("opinion").get()
        console.log(querySnapshot)

        const scores = [];
       
        querySnapshot.forEach(doc => {
            const data = doc.data();
            let opinionCount = 0;
            let evalCount = 0;

            // カテゴリに応じて使用するデータを切り替える
            if (category === 'all') {
                opinionCount = data.totalOpinions || 0;
                evalCount = data.totalEvaluations || 0;
            } else {
                opinionCount = data.categoryOpinions?.[category] || 0;
                evalCount = data.categoryEvaluations?.[category] || 0;
            }

            // スコアを計算
            const score = opinionCount * evalCount;
            
            scores.push({
                locationId: doc.id, // "bldg21"など
                score: score
            });
        });

        // 計算したスコアを基に、ヒートマップの見た目を更新
        renderHeatmap(scores);

    } catch (error) {
        console.error("ヒートマップデータの取得に失敗しました:", error);
    }
}

/**
 * 計算されたスコアを基に、HTML要素のopacityを更新する関数
 * @param {Array} scores - 各場所のIDとスコアの配列
 */
function renderHeatmap(scores) {
    // 全スコアの中で最大のスコアを見つける（0除算を避ける）
    const maxScore = Math.max(...scores.map(item => item.score), 1);

    scores.forEach(item => {
        // スコアを 0.0 ～ 0.8 の範囲に正規化して、色の濃さ（opacity）を決定
        // (最大でも半透明にすることで、下の地図が見えるようにする)
        const intensity = (item.score / maxScore) * 0.8;

        const overlayElement = document.getElementById(`hazard-${item.locationId}`);
        if (overlayElement) {
            overlayElement.style.opacity = intensity;
        }
    });
}

// --- イベントリスナーの設定 ---
categoryButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        event.preventDefault();
        const category = button.dataset.category;
        updateHeatmap(category);
    });
});

// --- 初期表示 ---
// ページが読み込まれたら、最初に「すべて」のヒートマップを表示
document.addEventListener('DOMContentLoaded', () => {
    updateHeatmap('all');
});

// Firebase設定（自分のプロジェクトの設定に置き換えてください）
const firebaseConfig = {
  apiKey: "AIzaSyDJ4wJ3YUbXFfvmQdsBVDyd8TZBfmIn3Eg",
  authDomain: "hackit-d394f.firebaseapp.com",
  projectId: "hackit-d394f",
  storageBucket: "hackit-d394f.firebasestorage.app",
  messagingSenderId: "73269710558",
  appId: "1:73269710558:web:97c3f0061dd8bc72ecbc4f",
  measurementId: "G-4MBQ6S9SDC"
};