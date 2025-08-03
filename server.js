const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Firebase設定を提供するエンドポイント
app.get('/api/firebase-config', (req, res) => {
  const clientConfig = {
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "hackit-d394f.firebaseapp.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "hackit-d394f",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "hackit-d394f.firebasestorage.app",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "73269710558",
    appId: process.env.FIREBASE_APP_ID || "1:73269710558:web:97c3f0061dd8bc72ecbc4f",
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-4MBQ6S9SDC"
  };
  
  console.log(' クライアントにFirebase設定を提供:', {
    authDomain: clientConfig.authDomain,
    projectId: clientConfig.projectId
  });
  
  res.json(clientConfig);
});

// HTMLファイルを動的に生成するエンドポイント
app.get('/', (req, res) => {
  const htmlPath = path.join(__dirname, 'index.html');
  let html = require('fs').readFileSync(htmlPath, 'utf8');
  
  // 環境変数をHTMLに埋め込む（開発環境のみ）
  if (process.env.NODE_ENV === 'development') {
    html = html.replace('{{ FIREBASE_API_KEY }}', process.env.FIREBASE_API_KEY || '');
    html = html.replace('{{ FIREBASE_AUTH_DOMAIN }}', process.env.FIREBASE_AUTH_DOMAIN || '');
    html = html.replace('{{ FIREBASE_PROJECT_ID }}', process.env.FIREBASE_PROJECT_ID || '');
    html = html.replace('{{ FIREBASE_STORAGE_BUCKET }}', process.env.FIREBASE_STORAGE_BUCKET || '');
    html = html.replace('{{ FIREBASE_MESSAGING_SENDER_ID }}', process.env.FIREBASE_MESSAGING_SENDER_ID || '');
    html = html.replace('{{ FIREBASE_APP_ID }}', process.env.FIREBASE_APP_ID || '');
    html = html.replace('{{ FIREBASE_MEASUREMENT_ID }}', process.env.FIREBASE_MEASUREMENT_ID || '');
  }
  
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('🚀 Firebase Automation機能が有効です');
}); 