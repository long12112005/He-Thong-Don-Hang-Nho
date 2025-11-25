/**
 * js/login.js
 * Logic xử lý trang đăng nhập
 */

const LOGIN_PAGE = 'login.html';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Lấy các thành phần DOM
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessageElement = document.getElementById('errorMessage');
    const loginButton = document.getElementById('loginButton');
    const messageElement = document.getElementById('message');

    // 2. Định nghĩa trang chuyển hướng khi đăng nhập thành công
    const HOME_PAGE = 'products.html';
    const USER_PAGE = 'order.html';
    const DEFAULT_PAGE = 'index.html'; // Hoặc index.html

    /** 
     * Hiển thị thông báo lỗi
     * @param {string} message Thông báo
     */
    const showLoginError = (message) => {
        errorMessageElement.textContent = message;
        errorMessageElement.style.display = 'block';
    };

    /**
     * Ẩn thông báo lỗi
     */
    const hideLoginError = () => {
        errorMessageElement.style.display = 'none';
        errorMessageElement.textContent = '';
    };

    /**
     * Xử lý sự kiện gửi form
     * @param {Event} event 
     */
    const handleLogin = async (event) => {
        event.preventDefault(); // Ngăn chặn hành vi gửi form mặc định

        hideLoginError();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            showLoginError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
            return;
        }

        // Tạm thời vô hiệu hóa nút để tránh gửi nhiều lần
        loginButton.disabled = true;
        loginButton.textContent = 'Đang xử lý...';

        try {
            // Gửi request đăng nhập qua AuthService đã tạo ở file kia
            // Giả định AuthService đã được định nghĩa trên global scope (window) hoặc là module
            const result = await AuthService.login(username, password);
            
            // 4. Xử lý: Login đúng -> chuyển sang trang chính
            if (result) {
                alert('Đăng nhập thành công!');
                // Chuyển hướng người dùng. 
                // Cần tính toán lại đường dẫn tương đối (từ login.html -> products.html)
                // Từ pages/login.html lên wwwroot/pages/products.html
                window.location.href = HOME_PAGE; 
            }

        } catch (error) {
            // 3. Xử lý: Login sai -> hiện thông báo lỗi
            showLoginError(error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
        } finally {
            // Luôn bật lại nút sau khi xử lý xong
            loginButton.disabled = false;
            loginButton.textContent = 'Đăng nhập';
        }
    };

    // 5. Gắn lắng nghe sự kiện
    loginForm.addEventListener('submit', handleLogin);
});