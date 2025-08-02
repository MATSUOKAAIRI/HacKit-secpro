require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// メール設定（Gmailを使用）
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// パスワードリセットメール送信API
app.post('/api/send-reset-email', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'メールアドレスが必要です' });
        }

        // リセットトークンを生成
        const resetToken = 'reset_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const userId = 'U' + Date.now();
        
        // リセットリンクを生成
        const resetLink = `https://your-domain.pages.dev/password-reset-confirm.html?email=${encodeURIComponent(email)}&user_id=${userId}&token=${resetToken}`;
        
        // メール内容
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'HacKit Security - パスワードリセット',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
                        <h1 style="color: #333; margin: 0;">HacKit Security</h1>
                        <p style="color: #666; margin: 10px 0;">パスワードリセット</p>
                    </div>
                    
                    <div style="padding: 20px;">
                        <h2 style="color: #333;">パスワードリセットのリクエスト</h2>
                        <p>以下のリンクをクリックして、新しいパスワードを設定してください。</p>
                        
                        <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px;">
                            <p style="margin: 0;"><strong>メールアドレス:</strong> ${email}</p>
                            <p style="margin: 5px 0;"><strong>ユーザーID:</strong> ${userId}</p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetLink}" 
                               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                パスワードをリセット
                            </a>
                        </div>
                        
                        <p style="color: #666; font-size: 14px;">
                            このリンクは24時間有効です。<br>
                            このメールに心当たりがない場合は、無視してください。
                        </p>
                        
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                        
                        <p style="color: #999; font-size: 12px;">
                            このメールは自動送信されています。<br>
                            ご質問がございましたら、サポートまでお問い合わせください。
                        </p>
                    </div>
                </div>
            `
        };

        // メール送信
        await transporter.sendMail(mailOptions);
        
        res.json({ 
            success: true, 
            message: 'パスワードリセットメールを送信しました',
            email: email,
            resetLink: resetLink // デモ用（実際の実装では削除）
        });
        
    } catch (error) {
        console.error('メール送信エラー:', error);
        res.status(500).json({ 
            error: 'メール送信に失敗しました',
            details: error.message 
        });
    }
});

// メール設定確認API
app.get('/api/email-config', (req, res) => {
    const isConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
    res.json({ 
        configured: isConfigured,
        message: isConfigured ? 'メール設定が完了しています' : 'メール設定が必要です'
    });
});

// ルートページ
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 環境変数を安全にクライアントに提供するAPI
app.get('/api/config', (req, res) => {
    res.json({
        firebase: {
            apiKey: process.env.FIREBASE_API_KEY,
            authDomain: process.env.FIREBASE_AUTH_DOMAIN,
            projectId: process.env.FIREBASE_PROJECT_ID,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.FIREBASE_APP_ID,
            measurementId: process.env.FIREBASE_MEASUREMENT_ID
        }
    });
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`サーバーが起動しました: http://localhost:${PORT}`);
    console.log('メール設定:', {
        user: process.env.EMAIL_USER ? '設定済み' : '未設定',
        pass: process.env.EMAIL_PASS ? '設定済み' : '未設定'
    });
}); 