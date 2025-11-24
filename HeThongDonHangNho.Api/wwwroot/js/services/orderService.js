/**
 * js/services/orderService.js
 * Chứa hàm gọi API Tạo Đơn hàng (Order)
 */

const API_BASE_URL = 'http://localhost:5161/api'; // Ví dụ: Giả sử API chạy trên cổng 5000
const ORDERS_URL = `${API_BASE_URL}/orders`;

// Hàm hỗ trợ gọi API có token (lặp lại từ productService.js để đảm bảo tính độc lập)
const authenticatedFetch = async (url, options = {}) => {
    // Giả định AuthService.getToken() đã có
    const token = AuthService.getToken(); 
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`; 
    }

    const response = await fetch(url, {
        ...options, 
        headers: headers
    });

    if (response.status === 401) {
        // Nếu token hết hạn, chuyển hướng về login
        AuthService.logout();
        window.location.href = 'login.html'; 
        throw new Error('Unauthorized');
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Lỗi không xác định.' }));
        throw new Error(errorData.message || `Lỗi API: ${response.status}`);
    }

    return response;
};


const OrderService = {
    /**
     * Gửi request tạo đơn hàng lên API
     * @param {object} orderData Dữ liệu đơn hàng (Khách hàng, Địa chỉ, Chi tiết sản phẩm)
     */
    async createOrder(orderData) {
        const response = await authenticatedFetch(ORDERS_URL, {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
        
        // API trả về thông tin đơn hàng vừa tạo (thường là Order ID)
        return response.json(); 
    }
};