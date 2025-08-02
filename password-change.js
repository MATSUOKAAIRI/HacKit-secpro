// パスワード変更画面のJavaScript
document.addEventListener('DOMContentLoaded', function() {
    const passwordForm = document.getElementById('passwordForm');
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
    const passwordBtn = document.getElementById('passwordBtn');

    const currentPasswordError = document.getElementById('currentPasswordError');
    const newPasswordError = document.getElementById('newPasswordError');
    const confirmNewPasswordError = document.getElementById('confirmNewPasswordError');

    function validatePassword(password) {
        return password.length >= 8;
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

    onAuthStateChanged(function(user) {
        if (!user) {
            alert('ログインが必要です');
            window.location.href = 'login.html';
        }
    });

    currentPasswordInput.addEventListener('input', function() {
        if (this.value && this.value.length < 6) {
            showError(this, currentPasswordError, 'パスワードは6文字以上で入力してください');
        } else {
            hideError(this, currentPasswordError);
        }
    });

    newPasswordInput.addEventListener('input', function() {
        if (this.value && !validatePassword(this.value)) {
            showError(this, newPasswordError, 'パスワードは8文字以上で入力してください');
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
            showError(newPasswordInput, newPasswordError, 'パスワードは8文字以上で入力してください');
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
                const result = await updatePassword(newPassword);
                
                if (result.success) {
                    alert('パスワードが正常に変更されました！');
                    passwordForm.reset();
                    passwordStrength.style.display = 'none';
                } else {
                    const errorMessage = getErrorMessage(result.error);
                    alert('パスワード変更に失敗しました: ' + errorMessage);
                }
            } catch (error) {
                console.error('パスワード変更エラー:', error);
                alert('パスワード変更に失敗しました。ネットワーク接続を確認してください。');
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