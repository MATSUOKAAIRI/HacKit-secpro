// Firebase Automation機能を活用したメインページ
import { authClient, authStateManager } from './auth-client.js';

let currentUser = null;
let posts = [];

// 認証状態の監視
async function initializeMainApp() {
  try {
    console.log('Firebase Automation機能で初期化を開始します...');
    
    // 認証状態を監視
    authStateManager.addListener((user) => {
      currentUser = user;
      console.log('認証状態が変更されました:', user ? 'ログイン済み' : '未ログイン');
      updateUI();
    });
    
    // 初期化が完了するまで待機
    await authStateManager.waitForInitialization();
    
    // 現在のユーザーを取得
    currentUser = await authClient.getCurrentUser();
    console.log('現在のユーザー:', currentUser);
    
    // 投稿を読み込み
    await loadPosts();
    
    // マップエリアのホバー機能を設定
    setupMapAreaHover();
    
  } catch (error) {
    console.error('Firebase Automation初期化でエラーが発生しました:', error);
  }
}

// マップエリアのホバー機能を設定
function setupMapAreaHover() {
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
}
// firebase-config.js から初期化済みの db をインポート
// import { db } from './firebase-config.js';

// --- DOM要素の取得 ---
const categoryButtons = document.querySelectorAll('.category-filters .category-button');

// db繋ぎこみ確認のため定義
let db = null;

/**
 * Firestoreからデータを取得し、スコアを計算してヒートマップを更新するメイン関数
 * @param {string} category - 表示するカテゴリ名 ('all' または '施設/設備' など)
 */
async function updateHeatmap(category = 'all') {
    try {
        // auth-client.jsを使用してFirebaseを初期化
        await authClient.initializeFirebase();
        db = await authClient.getFirestoreDB();
        
        // Firestore関数を動的import
        const { collection, getDocs, query } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        
        console.log('Firestore DB接続確認:', db);
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
            } else if (op.place === "6号館") {
                six += 1;   
            }
            else if (op.place === "6号館") {
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
});

console.log("1号館の数:", one);
console.log("2号館の数:", two);
console.log("3号館の数:", three);
console.log("5号館の数:", five);
console.log("6号館の数:", six);
console.log("6号館の数:", osix);
console.log("7号館の数:", seven);
console.log("8号館の数:", eight);
console.log("12号館の数:", twelve);
console.log("21号館の数:", twntyone);
console.log("23号館の数:", twenythree);
console.log("24号館の数:", twentfour);
console.log("27号館の数:", twentysevwn);
console.log("その他の数:", other);


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

// 投稿を読み込む関数（簡易版）
async function loadPosts() {
  try {
    console.log('投稿の読み込みを開始...');
    // ここで投稿データを読み込む処理を追加できます
    console.log('投稿の読み込み完了');
  } catch (error) {
    console.error('投稿の読み込みエラー:', error);
  }
}

// UIを更新する関数
function updateUI() {
  console.log('UI更新:', currentUser ? 'ログイン済み' : '未ログイン');
  // ここでUIの更新処理を追加できます
}

// --- 初期表示 ---
// ページが読み込まれたら、アプリケーションを初期化
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM読み込み完了、アプリケーション初期化を開始...');
  await initializeMainApp();
  updateHeatmap('all');
});

// Firebase設定はauth-client.jsで動的に取得されます