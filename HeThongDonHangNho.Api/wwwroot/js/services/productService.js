/**
 * js/services/productService.js
 * Chứa các hàm gọi API CRUD Sản phẩm
 */

// Định nghĩa base URL và lấy token từ AuthService
// Giả định AuthService và API_BASE_URL (hoặc callApi) đã được định nghĩa và tải
const API_BASE_URL = 'http://localhost:5161/api';
const PRODUCTS_URL = `${API_BASE_URL}/products`;

// Hàm hỗ trợ gọi API, tự động thêm JWT token
const authenticatedFetch = async (url, options = {}) => {
    const token = AuthService.getToken(); // Lấy token đã lưu
    
    // Nếu không có token, hàm này vẫn gọi, nhưng backend sẽ xử lý lỗi 401
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        // Gắn JWT token vào Header
        headers['Authorization'] = `Bearer ${token}`; 
    }

    const response = await fetch(url, {
        ...options,
        headers: headers
    });

    if (response.status === 401 || response.status === 403) {
        // Xử lý lỗi 401 (chưa đăng nhập) hoặc 403 (không có quyền)
        throw new Error(response.status === 401 ? 'Unauthorized' : 'Forbidden');
    }

    return response;
};


const ProductService = {
    /**
     * Lấy danh sách sản phẩm
     */
    async getProducts() {
        const response = await authenticatedFetch(PRODUCTS_URL);
        if (!response.ok) {
            throw new Error('Không thể lấy danh sách sản phẩm.');
        }
        return response.json();
    },

    /**
     * Thêm sản phẩm mới
     */
    async addProduct(productData) {
        const response = await authenticatedFetch(PRODUCTS_URL, {
            method: 'POST',
            body: JSON.stringify(productData)
        });
        if (!response.ok) {
            throw new Error('Thêm sản phẩm thất bại.');
        }
        return response.json();
    },

    /**
     * Cập nhật sản phẩm
     */
    async updateProduct(id, productData) {
        const response = await authenticatedFetch(`${PRODUCTS_URL}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
        if (!response.ok) {
            throw new Error('Cập nhật sản phẩm thất bại.');
        }
        return response.json();
    },

    /**
     * Xóa sản phẩm
     */
    async deleteProduct(id) {
        const response = await authenticatedFetch(`${PRODUCTS_URL}/${id}`, {
            method: 'DELETE'
        });
        // API thường trả về 204 No Content khi xóa thành công
        if (response.status !== 204 && response.ok) {
             return true; // Xóa thành công
        }
        if (!response.ok) {
             throw new Error('Xóa sản phẩm thất bại.');
        }
        return true;
    }
};