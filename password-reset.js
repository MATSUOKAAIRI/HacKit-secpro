import { sendPasswordResetEmail, getErrorMessage } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', function() {
    const passwordResetForm = document.getElementById('passwordResetForm');
    const emailInput = document.getElementById('email');
    const resetBtn = document.getElementById('resetBtn');
    const emailError = document.getElementById('emailError');

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

    emailInput.addEventListener('input', function() {
        if (this.value && !validateEmail(this.value)) {
            showError(this, emailError, '有効なメールアドレスを入力してください');
        } else {
            hideError(this, emailError);
        }
    });

    passwordResetForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        let isValid = true;

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
            resetBtn.disabled = true;
            resetBtn.textContent = '送信中...';

            try {
                const result = await sendPasswordResetEmail(email);
                
                if (result.success) {
                    alert('パスワードリセットメールを送信しました。\nメールをご確認ください。\n\n送信先: ' + email);
                    passwordResetForm.reset();
                } else {
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

    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            passwordResetForm.dispatchEvent(new Event('submit'));
        }
    });
}); 