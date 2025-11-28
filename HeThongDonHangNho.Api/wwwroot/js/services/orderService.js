/**
 * js/services/orderService.js
 * Chứa hàm gọi API Đơn hàng (Order)
 */

// Dùng API_BASE_URL chung
const ORDERS_URL = `${window.API_BASE_URL}/Orders`;

// Hàm hỗ trợ gọi API có token
const orderAuthenticatedFetch = async (url, options = {}) => {
    const token = AuthService.getToken();

    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (response.status === 401) {
        AuthService.logout();
        throw new Error('Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.');
    }

    return response;
};

// orderService.js

// ... (Bỏ qua các đoạn code khác)

const OrderService = {
    /**
     * Tạo đơn hàng mới
     * orderData: {
     * shippingAddress: string,
     * status: string,
     * orderDetails: [{ productId, quantity, unitPrice }]
     * }
     */
    async createOrder(orderData) {
        const response = await orderAuthenticatedFetch(ORDERS_URL, {
            method: 'POST',
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            // 💡 SỬA ĐỔI: Lấy thông báo lỗi chi tiết từ server
            const errorBody = await response.json().catch(() => ({}));
            let errorMessage = errorBody.message || 'Tạo đơn hàng thất bại.';
            
            // Xử lý lỗi 400 (Validation Error) thường có trong trường 'errors'
            if (response.status === 400 && errorBody.errors) {
                // Trích xuất các thông báo lỗi và nối lại
                const validationErrors = Object.values(errorBody.errors).flat();
                if (validationErrors.length > 0) {
                    errorMessage = 'Lỗi dữ liệu: ' + validationErrors.join(' | ');
                }
            } else if (errorBody.title || errorBody.detail) {
                 // Dùng các trường lỗi phổ biến khác
                 errorMessage = errorBody.title || errorBody.detail;
            }

            throw new Error(errorMessage);
        }

        return response.json();
    },
// ... (Tiếp tục các hàm khác)

    /**
     * Lấy danh sách đơn hàng của user hiện tại
     * CẦN có endpoint GET /api/Orders/my bên backend
     */
    async getOrdersByUser() {
        const response = await orderAuthenticatedFetch(`${ORDERS_URL}/my`, {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error('Không tải được danh sách đơn hàng.');
        }

        return response.json();
    },

    /**
     * Lấy chi tiết 1 đơn hàng
     */
    async getOrderDetail(orderId) {
        const response = await orderAuthenticatedFetch(`${ORDERS_URL}/${orderId}`, {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error('Không tải được chi tiết đơn hàng.');
        }

        return response.json();
    }
};

window.OrderService = OrderService;
