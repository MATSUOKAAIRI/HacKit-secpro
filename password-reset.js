// パスワードリセット画面のJavaScript
document.addEventListener('DOMContentLoaded', function() {
    const passwordResetForm = document.getElementById('passwordResetForm');
    const emailInput = document.getElementById('email');
    const resetBtn = document.getElementById('resetBtn');
    const emailError = document.getElementById('emailError');

    // バリデーション関数
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showError(input, errorElement, message) {
        input.classList.add('error');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    function hideError(input, errorElement) {
        input.classList.remove('error');
        errorElement.style.display = 'none';
    }

    // リアルタイムバリデーション
    emailInput.addEventListener('input', function() {
        if (this.value && !validateEmail(this.value)) {
            showError(this, emailError, '有効なメールアドレスを入力してください');
        } else {
            hideError(this, emailError);
        }
    });

    // フォーム送信処理
    passwordResetForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        let isValid = true;

        // バリデーション
        if (!email) {
            showError(emailInput, emailError, 'メールアドレスを入力してください');
            isValid = false;
        } else if (!validateEmail(email)) {
            showError(emailInput, emailError, '有効なメールアドレスを入力してください');
            isValid = false;
        } else {
            hideError(emailInput, emailError);
        }

        if (isValid) {
            // リセットボタンを無効化
            resetBtn.disabled = true;
            resetBtn.textContent = '送信中...';

            try {
                // Firebaseでパスワードリセットメール送信
                const result = await sendPasswordResetEmail(email);
                
                if (result.success) {
                    // 送信成功
                    alert('パスワードリセットメールを送信しました。\nメールをご確認ください。\n\n送信先: ' + email);
                    passwordResetForm.reset();
                } else {
                    // 送信失敗
                    const errorMessage = getErrorMessage(result.error);
                    alert('メール送信に失敗しました: ' + errorMessage);
                }
            } catch (error) {
                console.error('メール送信エラー:', error);
                alert('メール送信に失敗しました。ネットワーク接続を確認してください。');
            } finally {
                resetBtn.disabled = false;
                resetBtn.textContent = 'リセットリンクを送信';
            }
        }
    });

    // Enterキーで送信
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            passwordResetForm.dispatchEvent(new Event('submit'));
        }
    });
}); 