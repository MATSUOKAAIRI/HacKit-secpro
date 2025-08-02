// パスワードリセット確認画面のJavaScript
document.addEventListener('DOMContentLoaded', function() {
    const newPasswordForm = document.getElementById('newPasswordForm');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
    const setPasswordBtn = document.getElementById('setPasswordBtn');
    const userInfoElement = document.getElementById('userInfo');

    // エラー要素
    const newPasswordError = document.getElementById('newPasswordError');
    const confirmNewPasswordError = document.getElementById('confirmNewPasswordError');

    // バリデーション関数
    function validatePassword(password) {
        return password.length >= 8;
    }

    function checkPasswordStrength(password) {
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

    // URLパラメータからユーザー情報を取得
    function getUserInfoFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('user_id');
        const email = urlParams.get('email');
        const token = urlParams.get('token');
        
        return { userId, email, token };
    }

    // ユーザー情報を表示
    function displayUserInfo(userInfo) {
        if (userInfo.email) {
            userInfoElement.innerHTML = `
                <div class="user-details">
                    <p><strong>メールアドレス:</strong> ${userInfo.email}</p>
                    <p><strong>ユーザーID:</strong> ${userInfo.userId || 'N/A'}</p>
                </div>
            `;
        } else {
            userInfoElement.innerHTML = `
                <div class="user-details error">
                    <p>ユーザー情報が見つかりません。有効なリセットリンクを使用してください。</p>
                </div>
            `;
        }
    }

    // ページ読み込み時にユーザー情報を表示
    window.addEventListener('load', function() {
        const userInfo = getUserInfoFromURL();
        displayUserInfo(userInfo);
        
        // トークンがない場合はエラー
        if (!userInfo.token) {
            alert('無効なリセットリンクです。パスワードリセットを再度実行してください。');
            window.location.href = 'password-reset.html';
        }
    });

    // リアルタイムバリデーション
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
    });

    confirmNewPasswordInput.addEventListener('input', function() {
        if (this.value && this.value !== newPasswordInput.value) {
            showError(this, confirmNewPasswordError, 'パスワードが一致しません');
        } else {
            hideError(this, confirmNewPasswordError);
        }
    });

    // フォーム送信処理
    newPasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const newPassword = newPasswordInput.value.trim();
        const confirmNewPassword = confirmNewPasswordInput.value.trim();
        let isValid = true;

        // バリデーション
        if (!newPassword) {
            showError(newPasswordInput, newPasswordError, '新しいパスワードを入力してください');
            isValid = false;
        } else if (!validatePassword(newPassword)) {
            showError(newPasswordInput, newPasswordError, 'パスワードは8文字以上で入力してください');
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
            // 設定ボタンを無効化
            setPasswordBtn.disabled = true;
            setPasswordBtn.textContent = '設定中...';

            try {
                // Firebaseでパスワード設定
                const result = await updatePassword(newPassword);
                
                if (result.success) {
                    // 設定成功
                    const userInfo = getUserInfoFromURL();
                    alert(`パスワードが正常に設定されました。\n\nユーザー: ${userInfo.email}\nログインページから新しいパスワードでログインしてください。`);
                    
                    // ログインページにリダイレクト
                    window.location.href = 'login.html';
                } else {
                    // 設定失敗
                    const errorMessage = getErrorMessage(result.error);
                    alert('パスワード設定に失敗しました: ' + errorMessage);
                }
            } catch (error) {
                console.error('パスワード設定エラー:', error);
                alert('パスワード設定に失敗しました。ネットワーク接続を確認してください。');
            } finally {
                setPasswordBtn.disabled = false;
                setPasswordBtn.textContent = 'パスワードを設定';
            }
        }
    });

    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            newPasswordForm.dispatchEvent(new Event('submit'));
        }
    });
}); 