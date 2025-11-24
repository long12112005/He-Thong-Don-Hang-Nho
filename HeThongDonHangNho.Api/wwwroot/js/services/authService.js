/**
 * js/services/authService.js
 * Chứa các hàm liên quan đến xác thực (Auth)
 */

// Giả định hàm `callApi` có sẵn từ `api.js` hoặc bạn sẽ tự tạo.
// Ví dụ: const API_BASE_URL = 'http://localhost:3000/api';

const AUTH_KEYS = {
    TOKEN: 'authToken'
};

const AuthService = {
    /**
     * Gửi request đăng nhập
     * @param {string} username Email hoặc Username
     * @param {string} password Mật khẩu
     * @returns {Promise<object>} Đối tượng user/payload nếu thành công
     */
    async login(username, password) {
        // Đây là nơi bạn gửi request POST đến API Login của bạn
        // Giả định API_BASE_URL/login là endpoint đăng nhập
        const API_URL = 'http://your-api-domain.com/api/login';  

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Đăng nhập thành công
                const token = data.token; // Giả sử API trả về { token: '...' }
                
                // Lưu token vào localStorage (hoặc sessionStorage)
                AuthService.saveToken(token); 
                
                return data; // Trả về dữ liệu thành công
            } else {
                // Đăng nhập thất bại (lỗi 400, 401,...)
                // Ném lỗi để bắt ở tầng UI
                throw new Error(data.message || 'Sai tên đăng nhập hoặc mật khẩu.');
            }
        } catch (error) {
            console.error("Lỗi khi gọi API Đăng nhập:", error);
            throw new Error('Không thể kết nối đến máy chủ hoặc lỗi không xác định.');
        }
    },

    /**
     * Lưu JWT token vào Local Storage
     * @param {string} token 
     */
    saveToken(token) {
        localStorage.setItem(AUTH_KEYS.TOKEN, token);
    },

    /**
     * Lấy token
     * @returns {string | null}
     */
    getToken() {
        return localStorage.getItem(AUTH_KEYS.TOKEN);
    },

    /**
     * Xóa token khi đăng xuất
     */
    logout() {
        localStorage.removeItem(AUTH_KEYS.TOKEN);
        // Có thể thêm logic gọi API logout nếu cần
    }
};

// Có thể xuất ra (export) nếu dùng module, hoặc gán vào window nếu dùng script thường
// Dùng script thường:
// window.AuthService = AuthService;