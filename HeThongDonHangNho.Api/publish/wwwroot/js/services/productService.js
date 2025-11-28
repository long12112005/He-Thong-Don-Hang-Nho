/**
 * js/services/productService.js
 * Chứa các hàm gọi API CRUD Sản phẩm
 */

// Dùng API_BASE_URL do authService.js set
// => nhớ load authService.js TRƯỚC file này
const PRODUCTS_URL = `${window.API_BASE_URL}/Products`;

// Hàm hỗ trợ gọi API, tự động thêm JWT token
const productAuthenticatedFetch = async (url, options = {}) => {
    const token = AuthService.getToken(); // Lấy token đã lưu

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
        // Hết phiên → về login
        AuthService.logout();
        throw new Error('Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.');
    }

    return response;
};

const ProductService = {
    /**
     * Lấy danh sách tất cả sản phẩm
     */
    async getProducts() {
        const response = await productAuthenticatedFetch(PRODUCTS_URL, {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error('Không thể lấy danh sách sản phẩm.');
        }

        return response.json();
    },

    /**
     * Thêm sản phẩm mới
     * @param {object} productData { name, price, description, stock, ... }
     */
    async addProduct(productData) {
        const response = await productAuthenticatedFetch(PRODUCTS_URL, {
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
     * @param {number} id
     * @param {object} productData
     */
    async updateProduct(id, productData) {
        const response = await productAuthenticatedFetch(`${PRODUCTS_URL}/${id}`, {
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
     * @param {number} id
     */
    async deleteProduct(id) {
        const response = await productAuthenticatedFetch(`${PRODUCTS_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Xóa sản phẩm thất bại.');
        }

        return true;
    }
};

window.ProductService = ProductService;
