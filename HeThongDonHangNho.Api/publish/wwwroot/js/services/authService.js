/**
 * js/services/authService.js
 * Chứa các hàm liên quan đến xác thực (Auth)
 */

// Base URL chung cho mọi service, ví dụ: http://localhost:5161/api

const API_BASE_URL = window.location.origin + '/api';

const AUTH_KEYS = {
    TOKEN: 'authToken',
    USER_NAME: 'authUserName',
    USER_ROLE: 'authUserRole',
    CUSTOMER_ID: 'authCustomerId'
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
            if (data.customerId) localStorage.setItem(AUTH_KEYS.CUSTOMER_ID, data.customerId);
            return data;
        } catch (error) {
            console.error('Lỗi khi gọi API đăng nhập:', error);
            throw new Error(error.message || 'Không thể kết nối tới máy chủ.');
        }
    },

    // Lưu / lấy token
    saveToken(token) {
        localStorage.setItem(AUTH_KEYS.TOKEN, token);
    },

    getToken() {
        return localStorage.getItem(AUTH_KEYS.TOKEN);
    },

    // Thông tin user lưu kèm
    getUserName() {
        return localStorage.getItem(AUTH_KEYS.USER_NAME);
    },

    getUserRole() {
        return localStorage.getItem(AUTH_KEYS.USER_ROLE);
    },

    // ✅ THÊM 2 HÀM MỚI cho products.js & orders.js dùng
    isLoggedIn() {
        return !!this.getToken();
    },
    getCustomerId() {
        const id = localStorage.getItem(AUTH_KEYS.CUSTOMER_ID);
        // Chuyển về số nguyên, nếu không có thì trả về null
        return id ? parseInt(id, 10) : null; 
    },

    // 💡 CẬP NHẬT: getUser() phải trả về CustomerId
    getUser() {
        const name = this.getUserName();
        const role = this.getUserRole();
        const customerId = this.getCustomerId(); // Lấy CustomerId

        if (!name && !role) return null;
        return { name, role, customerId }; // Trả về cả CustomerId
    },

    // 💡 CẬP NHẬT: Xóa CustomerId khi logout
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
