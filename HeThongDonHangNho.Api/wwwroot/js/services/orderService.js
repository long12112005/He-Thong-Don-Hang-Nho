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

const OrderService = {
    /**
     * Tạo đơn hàng mới
     * orderData: {
     *   shippingAddress: string,
     *   status: string,
     *   orderDetails: [{ productId, quantity, unitPrice }]
     * }
     */
    async createOrder(orderData) {
        const response = await orderAuthenticatedFetch(ORDERS_URL, {
            method: 'POST',
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || 'Tạo đơn hàng thất bại.');
        }

        return response.json();
    },

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
