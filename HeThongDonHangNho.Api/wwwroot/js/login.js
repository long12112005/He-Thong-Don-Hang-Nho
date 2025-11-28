/**
 * js/login.js
 * Logic xử lý trang đăng nhập
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessageElement = document.getElementById('errorMessage');
    const loginButton = document.getElementById('loginButton');

    // Page redirect theo role
    const ADMIN_PAGE = 'products.html';
    const USER_PAGE = 'order.html';
    const DEFAULT_PAGE = 'index.html';

    const showError = (message) => {
        errorMessageElement.textContent = message;
        errorMessageElement.style.display = 'block';
    };

    const clearError = () => {
        errorMessageElement.style.display = 'none';
        errorMessageElement.textContent = '';
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        clearError();

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            showError('Vui lòng nhập đầy đủ email và mật khẩu.');
            return;
        }

        loginButton.disabled = true;
        loginButton.textContent = 'Đang đăng nhập...';

        try {
            const result = await AuthService.login(username, password);

            // Lấy role từ LocalStorage
            const role = AuthService.getUserRole();

            let redirectPage = DEFAULT_PAGE;
            if (role === 'Admin') redirectPage = ADMIN_PAGE;
            else if (role === 'User') redirectPage = USER_PAGE;

            window.location.href = redirectPage;

        } catch (error) {
            showError(error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
        } finally {
            loginButton.disabled = false;
            loginButton.textContent = 'Đăng nhập';
        }
    };

    loginForm.addEventListener('submit', handleLogin);
});
