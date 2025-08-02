import { onAuthStateChanged, createUserWithEmailAndPassword, getErrorMessage } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const signupBtn = document.getElementById('signupBtn');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function validatePassword(password) {
        return password.length >= 6;
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

    passwordInput.addEventListener('input', function() {
        if (this.value && !validatePassword(this.value)) {
            showError(this, passwordError, 'パスワードは6文字以上で入力してください');
        } else {
            hideError(this, passwordError);
        }
        if (confirmPasswordInput.value) {
            if (this.value !== confirmPasswordInput.value) {
                showError(confirmPasswordInput, confirmPasswordError, 'パスワードが一致しません');
            } else {
                hideError(confirmPasswordInput, confirmPasswordError);
            }
        }
    });

    confirmPasswordInput.addEventListener('input', function() {
        if (this.value && this.value !== passwordInput.value) {
            showError(this, confirmPasswordError, 'パスワードが一致しません');
        } else {
            hideError(this, confirmPasswordError);
        }
    });

    onAuthStateChanged(function(user) {
        if (user) {
            window.location.href = 'index.html';
        }
    });

    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
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
        } else if (!validatePassword(password)) {
            showError(passwordInput, passwordError, 'パスワードは6文字以上で入力してください');
            isValid = false;
        } else {
            hideError(passwordInput, passwordError);
        }

        if (!confirmPassword) {
            showError(confirmPasswordInput, confirmPasswordError, 'パスワード確認を入力してください');
            isValid = false;
        } else if (password !== confirmPassword) {
            showError(confirmPasswordInput, confirmPasswordError, 'パスワードが一致しません');
            isValid = false;
        } else {
            hideError(confirmPasswordInput, confirmPasswordError);
        }

        if (isValid) {
            signupBtn.disabled = true;
            signupBtn.textContent = '登録中...';

            try {
                const result = await createUserWithEmailAndPassword(email, password);
                
                if (result.success) {
                    alert('アカウントの作成に成功しました！\nメールアドレスの確認をお願いします。');
                    window.location.href = 'login.html';
                } else {
                    const errorMessage = getErrorMessage(result.error);
                    alert('アカウントの作成に失敗しました: ' + errorMessage);
                }
            } catch (error) {
                console.error('登録エラー:', error);
                alert('アカウントの作成に失敗しました。ネットワーク接続を確認してください。');
            } finally {
                signupBtn.disabled = false;
                signupBtn.textContent = 'アカウント作成';
            }
        }
    });

    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            signupForm.dispatchEvent(new Event('submit'));
        }
    });
}); 