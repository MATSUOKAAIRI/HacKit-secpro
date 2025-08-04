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
// import { db } from './firebase-config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, query } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// --- DOM要素の取得 ---
const categoryButtons = document.querySelectorAll('.category-filters .category-button');
const areas = document.querySelectorAll('map[name="campus-map"] area');

// --- ページ読み込み完了後のメイン処理 ---
document.addEventListener('DOMContentLoaded', () => {
    // 機能1：ピンの表示/非表示イベントを設定
    setupPinHoverEvents();

    // 機能2：初期表示として「すべて」のヒートマップを表示
    updateHeatmap('all');
});


/**
 * 機能1：ピンの表示/非表示機能をセットアップする関数
 */
function setupPinHoverEvents() {
    areas.forEach(area => {
        // マウスがareaに入った時
        area.addEventListener('mouseover', () => {
            const pinId = area.dataset.pinId;
            if (pinId) {
                const pin = document.getElementById(pinId);
                if (pin) pin.classList.add('is-visible');
            }
        });
        // マウスがareaから出た時
        area.addEventListener('mouseout', () => {
            const pinId = area.dataset.pinId;
            if (pinId) {
                const pin = document.getElementById(pinId);
                if (pin) pin.classList.remove('is-visible');
            }
        });
    });
}
// db繋ぎこみ確認のため定義

let db = null;


// /**
//  * Firestoreからデータを取得し、スコアを計算してヒートマップを更新するメイン関数
//  * @param {string} category - 表示するカテゴリ名 ('all' または '施設/設備' など)
//  */
async function updateHeatmap(category = 'all') {
    try {
        // サーバーから環境変数を取得して設定を更新
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
        console.log(db)
        const locationsRef = collection(db, "opinion");
        const q = query(locationsRef);
        
        console.log(locationsRef)
        console.log("test db!!!!!!!!")
        const querySnapshot = await getDocs(q);
        console.log("querySnapshot", querySnapshot)
       

        const scores = [];
        const datas = [];
    querySnapshot.forEach(doc => {
        const data = doc.data();
        datas.push(data); // 取り出したdataをdatas配列に追加
    });

    console.log("datas", datas)
    
    let opinionCount = 0;
    let emphasisCount = 0;

    // dataが配列の場合
    const opinions = Array.isArray(datas) ? datas : [];
    opinionCount = opinions.length;
    emphasisCount = opinions.reduce((sum, op) => sum + (op.empathy || 0), 0);
    console.log("opinionCount", opinionCount);
    console.log("emphasisCount", emphasisCount)
    const score = opinionCount * emphasisCount;
    scores.push({
        locationId: querySnapshot.id,
        score: score
    });
let one = 0; // 1号館カウント
let two = 0; // 2号館カウント
let three = 0; // 3号館カウント
let five = 0; // 5号館カウント
let six = 0; // 6号館カウント
let osix = 0; // 6号館カウント
let seven = 0; // 7号館カウント
let eight = 0; // 8号館カウント
let twelve = 0; // 12号館カウント
let twntyone = 0; // 21号館カウント
let twenythree = 0; // 23号館カウント
let twentfour = 0; // 24号館カウント
let twentysevwn = 0; // 27号館カウント
let other = 0; // その他号館カウント
let oneempty = 0; // 1号館のempathyカウント
let twoempty = 0; // 2号館のempathyカウント
let threeempty = 0; // 3号館のempathyカウント
let fiveempty = 0; // 5号館のempathyカウント
let sixempty = 0; // 6号館のempathyカウント
let osixempty = 0; // 6号館のempathyカウント
let sevenempty = 0; // 7号館のempathyカウント
let eightempty = 0; // 8号館のempathyカウント
let twelveempty = 0; // 12号館のempathyカウント
let twntyoneempty = 0; // 21号館のempathyカウント
let twenythreeempty = 0; // 23号館のempathyカウント
let twentfourempty = 0; // 24号館のempathyカウント
let twentysevwnempty = 0; // 27号館のempathyカウント
let otherempty = 0; // その他号館のempathyカウント
const placeEmphasisoneCount = {};
opinions.forEach(op => {
    if (op.place === "1号館") {
        one += 1;
    } else if (op.place === "2号館") {
        two += 1;
    } else if (op.place === "2号館") {
        two += 1;
    } else if (op.place === "3号館") {
        three  += 1;
    }  else if (op.place === "5号館") { 
        five += 1;
    } else if (op.place === "6号館/LC") {
        six += 1;   
    }
    else if (op.place === "6号館/ホール") {
        osix += 1;   
    }
    else if (op.place === "7号館") {
        seven += 1;
    } else if (op.place === "8号館") {
        eight += 1;
    } else if (op.place === "12号館") {
        twelve += 1;
    } else if (op.place === "21号館") {
        twntyone += 1;
    } else if (op.place === "23号館") {
        twenythree += 1;
    } else if (op.place === "24号館") {
        twentfour += 1;
    } else if (op.place === "27号館") {
        twentysevwn += 1;
    } else {
        other += 1; // その他の場所
    }

        if (op.place === "1号館") {
            oneempty += (op.empathy || 0); 
        } else if (op.place === "2号館") {
            twoempty += (op.empathy || 0);
        } else if (op.place === "3号館") {
            threeempty += (op.empathy || 0);
        } else if (op.place === "5号館") {
            fiveempty += (op.empathy || 0);
        } else if (op.place === "6号館/ホール") {
            sixempty += (op.empathy || 0);
        } else if (op.place === "6号館/LC") {
            osixempty += (op.empathy || 0);
        } else if (op.place === "7号館") {
            sevenempty += (op.empathy || 0);
        } else if (op.place === "8号館") {
            eightempty += (op.empathy || 0);
        } else if (op.place === "12号館") {
            twelveempty += (op.empathy || 0);
        } else if (op.place === "21号館") {
            twntyoneempty += (op.empathy || 0);
        } else if (op.place === "23号館") {
            twenythreeempty += (op.empathy || 0);
        } else if (op.place === "24号館") {
            twentfourempty += (op.empathy || 0);
        } else if (op.place === "27号館") {
            twentysevwnempty += (op.empathy || 0);
        } else {
            otherempty += (op.empathy || 0);
        }
    })
console.log("1号館の数:", one);
console.log("2号館の数:", two);
console.log("3号館の数:", three);
console.log("5号館の数:", five);
console.log("6号館/ホールの数:", six);
console.log("6号館/LCの数:", osix);
console.log("7号館の数:", seven);
console.log("8号館の数:", eight);
console.log("12号館の数:", twelve);
console.log("21号館の数:", twntyone);
console.log("23号館の数:", twenythree);
console.log("24号館の数:", twentfour);
console.log("27号館の数:", twentysevwn);
console.log("その他の数:", other);
console.log("1号館のempathy数:", oneempty);
console.log("2号館のempathy数:", twoempty);
console.log("3号館のempathy数:", threeempty);
console.log("5号館のempathy数:", fiveempty);
console.log("6号館/LCのempathy数:", sixempty);
console.log("6号館/ホールのempathy数:", osixempty);
console.log("7号館のempathy数:", sevenempty);
console.log("8号館のempathy数:", eightempty);
console.log("12号館のempathy数:", twelveempty);
console.log("21号館のempathy数:", twntyoneempty);
console.log("23号館のempathy数:", twenythreeempty);
console.log("24号館のempathy数:", twentfourempty);
console.log("27号館のempathy数:", twentysevwnempty);
console.log("その他のempathy数:", otherempty);

//         // 計算したスコアを基に、ヒートマップの見た目を更新
let scoresone = 0;
let scorestwo = 0;
let scoresthree = 0;
let scoresfive = 0;
let scoressix = 0;
let scoresosix = 0;
let scoresseven = 0;
let scoreseight = 0;
let scorestwelve = 0;
let scores21 = 0;
let scores23 = 0;
let scores24 = 0;
let scores27 = 0;
let scoresother = 0;

scoresone = one * oneempty;
// class名の取得　getOpacityClass(scoresone) 

//クラスを追加　どこへidかkurasu
scorestwo = two * twoempty;
scoresthree = three * threeempty;
scoresfive = five * fiveempty;
scoressix = six * sixempty;
scoresosix = osix * osixempty;
scoresseven = seven * sevenempty;
scoreseight = eight * eightempty;
scorestwelve = twelve * twelveempty;
scores21 = twntyone * twntyoneempty;
scores23 = twenythree * twenythreeempty;
scores24 = twentfour * twentfourempty;
scores27 = twentysevwn * twentysevwnempty;
scoresother = other * otherempty;

//if文で主分けしてｃｓｓの箱にいれる

// if scoresone ==0

        renderHeatmap(scores);

const judgeHeatmapOpacity = (score) => {
    // スコアを 0 ～ 10 の範囲に正規化
    // 最大スコアを 300 と仮定
    const maxScore = 250;
    const normalizedScore = Math.floor((score  /  maxScore) *10) 
    return normalizedScore;
}

const getOpacityClass = (score) => {
    const opacity = judgeHeatmapOpacity(score);
    return `hazard-opacity-${Math.round(opacity)}`;
}

// 各建物のヒートマップのopacityを設定
document.getElementById('hazard-bldg1').classList.add(getOpacityClass(scoresone));
document.getElementById('hazard-bldg2').classList.add(getOpacityClass(scorestwo));
document.getElementById('hazard-bldg3').classList.add(getOpacityClass(scoresthree));
document.getElementById('hazard-bldg5').classList.add(getOpacityClass(scoresfive));
document.getElementById('hazard-bldg6-lc').classList.add(getOpacityClass(scoressix));
document.getElementById('hazard-bldg6-hall').classList.add(getOpacityClass(scoresosix));
document.getElementById('hazard-bldg7').classList.add(getOpacityClass(scoresseven));
document.getElementById('hazard-bldg8').classList.add(getOpacityClass(scoreseight));
document.getElementById('hazard-bldg12').classList.add(getOpacityClass(scorestwelve));
document.getElementById('hazard-bldg21').classList.add(getOpacityClass(scores21));
document.getElementById('hazard-bldg23').classList.add(getOpacityClass(scores23));
document.getElementById('hazard-bldg24').classList.add(getOpacityClass(scores24));
document.getElementById('hazard-bldg27').classList.add(getOpacityClass(scores27));


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