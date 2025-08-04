const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// セキュリティ強化されたCORS設定
const corsOptions = {
  origin: function (origin, callback) {
    // 開発環境ではすべてのオリジンを許可
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      // 本番環境では許可されたドメインのみ
      const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
        process.env.ALLOWED_ORIGINS.split(',') : 
        ['https://yourdomain.com'];
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS policy violation'));
      }
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// ミドルウェア
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.static('.'));

// セキュリティヘッダーの追加
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com;");
  next();
});

// レート制限の実装
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // 15分間に最大100リクエスト
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Firebase設定を提供するエンドポイント（セキュリティ強化）
app.get('/api/firebase-config', (req, res) => {
  // 環境変数からAPIキーを取得
  const apiKey = process.env.FIREBASE_API_KEY;
  
  if (!apiKey) {
    console.error('FIREBASE_API_KEY環境変数が設定されていません');
    return res.status(500).json({ 
      error: 'Firebase設定が利用できません' 
    });
  }

  const clientConfig = {
    apiKey: apiKey,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "hackit-d394f.firebaseapp.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "hackit-d394f",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "hackit-d394f.firebasestorage.app",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "73269710558",
    appId: process.env.FIREBASE_APP_ID || "1:73269710558:web:97c3f0061dd8bc72ecbc4f",
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-4MBQ6S9SDC"
  };
  
  console.log('クライアントにFirebase設定を提供:', {
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

// エラーハンドリングミドルウェア
app.use((err, req, res, next) => {
  console.error('エラー:', err);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error' 
  });
});

// 404ハンドラー
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('🚀 Firebase Automation機能が有効です');
}); 