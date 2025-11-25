/**
 * js/services/authService.js
 * Chứa các hàm liên quan đến xác thực (Auth)
 */

// Base URL chung cho mọi service, ví dụ: http://localhost:5161/api
const API_BASE_URL = window.location.origin + '/api';

const AUTH_KEYS = {
    TOKEN: 'authToken',
    USER_NAME: 'authUserName',
    USER_ROLE: 'authUserRole'
};

const AuthService = {
    /**
     * Gửi request đăng nhập
     * @param {string} username  // ở đây là email
     * @param {string} password
     */
    async login(username, password) {
        const url = `${API_BASE_URL}/Auth/login`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: username,
                    password: password
                })
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || 'Sai email hoặc mật khẩu.');
            }

            const token = data.token;
            if (!token) {
                throw new Error('API không trả về token.');
            }

            // Lưu token + info cơ bản
            this.saveToken(token);
            if (data.name) localStorage.setItem(AUTH_KEYS.USER_NAME, data.name);
            if (data.role) localStorage.setItem(AUTH_KEYS.USER_ROLE, data.role);

            return data;
        } catch (error) {
            console.error('Lỗi khi gọi API đăng nhập:', error);
            throw new Error(error.message || 'Không thể kết nối tới máy chủ.');
        }
    },

    saveToken(token) {
        localStorage.setItem(AUTH_KEYS.TOKEN, token);
    },

    getToken() {
        return localStorage.getItem(AUTH_KEYS.TOKEN);
    },

    getUserName() {
        return localStorage.getItem(AUTH_KEYS.USER_NAME);
    },

    getUserRole() {
        return localStorage.getItem(AUTH_KEYS.USER_ROLE);
    },

    logout() {
        localStorage.removeItem(AUTH_KEYS.TOKEN);
        localStorage.removeItem(AUTH_KEYS.USER_NAME);
        localStorage.removeItem(AUTH_KEYS.USER_ROLE);
        window.location.href = 'login.html';
    }
};

// Cho các file khác xài
window.AuthService = AuthService;
window.API_BASE_URL = API_BASE_URL;
