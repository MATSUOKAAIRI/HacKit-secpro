import { authClient, authStateManager } from './auth-client.js';
document.addEventListener('DOMContentLoaded', async function() {
    const passwordForm = document.getElementById('passwordForm');
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
    const passwordBtn = document.getElementById('passwordBtn');

    const currentPasswordError = document.getElementById('currentPasswordError');
    const newPasswordError = document.getElementById('newPasswordError');
    const confirmNewPasswordError = document.getElementById('confirmNewPasswordError');

    function validatePassword(password) {
        return password.length >= 6;
    }

    function checkPasswordStrength(password) {
        let strength = 0;
        let message = '';
        let className = '';
        return { message, className };
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

    // 認証状態を確認
    async function checkAuthState() {
        try {
            console.log('パスワード変更画面 - 認証状態を確認中...');
            
            // Firebase初期化を待機
            await authClient.initializeFirebase();
            
            // 認証状態の初期化を待機
            await authStateManager.waitForInitialization();
            
            // 現在のユーザーを取得
            const user = await authClient.getCurrentUser();
            console.log('パスワード変更画面 - 現在のユーザー:', user);
            
            if (!user) {
                console.log('パスワード変更画面 - ログインが必要です');
                alert('ログインが必要です');
                window.location.href = 'login.html';
                return false;
            }
            
            console.log('パスワード変更画面 - 認証済みユーザー:', user.email);
            return true;
            
        } catch (error) {
            console.error('パスワード変更画面 - 認証状態確認エラー:', error);
            alert('認証状態の確認に失敗しました');
            window.location.href = 'login.html';
            return false;
        }
    }

    // ページ読み込み時に認証状態を確認
    const isAuthenticated = await checkAuthState();
    if (!isAuthenticated) {
        return; // 認証されていない場合は処理を停止
    }

    currentPasswordInput.addEventListener('input', function() {
        if (this.value && this.value.length < 6) {
            showError(this, currentPasswordError, 'パスワードは6文字以上で入力してください');
        } else {
            hideError(this, currentPasswordError);
        }
    });

    newPasswordInput.addEventListener('input', function() {
        if (this.value && !validatePassword(this.value)) {
            showError(this, newPasswordError, 'パスワードは6文字以上で入力してください');
        } else {
            hideError(this, newPasswordError);
        }

        if (confirmNewPasswordInput.value) {
            if (this.value !== confirmNewPasswordInput.value) {
                showError(confirmNewPasswordInput, confirmNewPasswordError, 'パスワードが一致しません');
            } else {
                hideError(confirmNewPasswordInput, confirmNewPasswordError);
            }
        }

        if (this.value && this.value === currentPasswordInput.value) {
            showError(this, newPasswordError, '現在のパスワードと同じパスワードは使用できません');
        } else if (this.value && validatePassword(this.value)) {
            hideError(this, newPasswordError);
        }
    });

    confirmNewPasswordInput.addEventListener('input', function() {
        if (this.value && this.value !== newPasswordInput.value) {
            showError(this, confirmNewPasswordError, 'パスワードが一致しません');
        } else {
            hideError(this, confirmNewPasswordError);
        }
    });

    passwordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // 再度認証状態を確認
        const isAuthenticated = await checkAuthState();
        if (!isAuthenticated) {
            return;
        }
        
        const currentPassword = currentPasswordInput.value.trim();
        const newPassword = newPasswordInput.value.trim();
        const confirmNewPassword = confirmNewPasswordInput.value.trim();
        let isValid = true;

        if (!currentPassword) {
            showError(currentPasswordInput, currentPasswordError, '現在のパスワードを入力してください');
            isValid = false;
        } else if (currentPassword.length < 6) {
            showError(currentPasswordInput, currentPasswordError, 'パスワードは6文字以上で入力してください');
            isValid = false;
        } else {
            hideError(currentPasswordInput, currentPasswordError);
        }

        if (!newPassword) {
            showError(newPasswordInput, newPasswordError, '新しいパスワードを入力してください');
            isValid = false;
        } else if (!validatePassword(newPassword)) {
            showError(newPasswordInput, newPasswordError, 'パスワードは6文字以上で入力してください');
            isValid = false;
        } else if (newPassword === currentPassword) {
            showError(newPasswordInput, newPasswordError, '現在のパスワードと同じパスワードは使用できません');
            isValid = false;
        } else {
            hideError(newPasswordInput, newPasswordError);
        }

        if (!confirmNewPassword) {
            showError(confirmNewPasswordInput, confirmNewPasswordError, 'パスワード確認を入力してください');
            isValid = false;
        } else if (newPassword !== confirmNewPassword) {
            showError(confirmNewPasswordInput, confirmNewPasswordError, 'パスワードが一致しません');
            isValid = false;
        } else {
            hideError(confirmNewPasswordInput, confirmNewPasswordError);
        }

        if (isValid) {
            passwordBtn.disabled = true;
            passwordBtn.textContent = '変更中...';

            try {
                // Firebase Authを使用してパスワードを更新
                const { updatePassword } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
                
                await authClient.initializeFirebase();
                const user = authClient.auth.currentUser;
                
                if (!user) {
                    throw new Error('ユーザーが認証されていません');
                }
                
                await updatePassword(user, newPassword);
                alert('パスワードが正常に変更されました！');
                passwordForm.reset();
                
            } catch (error) {
                console.error('パスワード変更エラー:', error);
                let errorMessage = 'パスワード変更に失敗しました';
                
                if (error.code === 'auth/requires-recent-login') {
                    errorMessage = 'セキュリティのため、再ログインが必要です';
                } else if (error.code === 'auth/weak-password') {
                    errorMessage = 'パスワードが弱すぎます';
                }
                
                alert(errorMessage);
            } finally {
                passwordBtn.disabled = false;
                passwordBtn.textContent = 'パスワード変更';
            }
        }
    });

    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            passwordForm.dispatchEvent(new Event('submit'));
        }
    });
}); 