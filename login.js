import { authClient, authStateManager } from './auth-client.js';

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
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

    // 認証状態の監視
    authStateManager.addListener(function(user) {
        if (user) {
            window.location.href = 'index.html';
        }
    });

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
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

        if (!password) {
            showError(passwordInput, passwordError, 'パスワードを入力してください');
            isValid = false;
        } else {
            hideError(passwordInput, passwordError);
        }

        if (isValid) {
            loginBtn.disabled = true;
            loginBtn.textContent = 'ログイン中...';

            try {
                const result = await authClient.login(email, password);
                
                if (result.success) {
                    alert('ログインに成功しました！');
                    // 認証状態を更新
                    authStateManager.updateAuthState(result.user);
                    window.location.href = 'index.html';
                } else {
                    alert('ログインに失敗しました: ' + result.error);
                }
            } catch (error) {
                console.error('ログインエラー:', error);
                alert('ログインに失敗しました。ネットワーク接続を確認してください。');
            } finally {
                loginBtn.disabled = false;
                loginBtn.textContent = 'ログイン';
            }
        }
    });

    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loginForm.dispatchEvent(new Event('submit'));
        }
    });
}); 