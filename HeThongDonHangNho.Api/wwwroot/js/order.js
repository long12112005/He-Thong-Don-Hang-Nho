/**
 * js/order.js
 * Logic xử lý trang Tạo Đơn hàng (Giỏ hàng)
 */

const LOGIN_PAGE = 'login.html';
const DECIMAL_PLACES = 0;

// Bộ nhớ sản phẩm và giỏ hàng
let availableProducts = [];
let cart = {};

document.addEventListener('DOMContentLoaded', () => {

    // 🔐 Kiểm tra đăng nhập
    const token = AuthService.getToken();
    if (!token) {
        window.location.href = LOGIN_PAGE;
        return;
    }

    // 🛑 Chỉ User được tạo đơn hàng
    const role = AuthService.getUserRole();
    if (role !== 'User') {
        window.location.href = 'products.html';
        return;
    }

    const productListElement = document.getElementById('productList');
    const cartItemsElement = document.getElementById('cartItems');
    const totalAmountElement = document.getElementById('totalAmount');
    const createOrderBtn = document.getElementById('createOrderBtn');
    const orderForm = document.getElementById('orderForm');
    const messageElement = document.getElementById('message');

    // 📌 Hiển thị message UI
    const displayMessage = (text, type = 'success') => {
        messageElement.textContent = text;
        messageElement.className = `alert alert-${type}`;
        messageElement.style.display = 'block';
        setTimeout(() => messageElement.style.display = 'none', 4000);
    };

    // 📌 Load danh sách sản phẩm
    const loadProducts = async () => {
        try {
            const products = await ProductService.getProducts();
            availableProducts = Object.fromEntries(products.map(p => [p.id, p]));
            renderProductSelection();
        } catch (err) {
            productListElement.innerHTML =
                `<p style="color:red;">Không thể tải sản phẩm. ${err.message}</p>`;
        }
    };

    // 📌 Render UI chọn sản phẩm
    const renderProductSelection = () => {
        document.getElementById('loadingMsg').style.display = 'none';

        const ids = Object.keys(availableProducts);
        if (!ids.length) {
            productListElement.innerHTML = `<p>Không có sản phẩm nào.</p>`;
            return;
        }

        productListElement.innerHTML = ids.map(id => {
            const p = availableProducts[id];
            return `
                <div class="product-item">
                    <h4>${p.name}</h4>
                    <p>Giá: ${p.price.toLocaleString('vi-VN')} VNĐ</p>
                    <label>Số lượng:</label>
                    <input type="number" min="0"
                        value="${cart[id] ? cart[id].quantity : 0}"
                        data-id="${id}"
                        class="quantity-input">
                </div>`;
        }).join('');

        document.querySelectorAll('.quantity-input').forEach(i =>
            i.addEventListener('input', handleQuantityChange));
    };

    // 📌 Cập nhật giỏ hàng
    const handleQuantityChange = (e) => {
        const id = e.target.dataset.id;
        const p = availableProducts[id];
        let q = +e.target.value || 0;

        if (q > 0) {
            cart[id] = { product: p, quantity: q, totalPrice: q * p.price };
        } else delete cart[id];

        updateCartSummary();
    };

    // 📌 Tính tổng và render giỏ hàng
    const updateCartSummary = () => {
        cartItemsElement.innerHTML = '';
        const keys = Object.keys(cart);

        if (!keys.length) {
            document.getElementById('emptyCartMsg').style.display = 'block';
            createOrderBtn.disabled = true;
            totalAmountElement.textContent = '0 VNĐ';
            return;
        }

        document.getElementById('emptyCartMsg').style.display = 'none';
        createOrderBtn.disabled = false;

        let total = 0;

        keys.forEach(id => {
            
            const item = cart[id];
            total += item.totalPrice;
            cartItemsElement.innerHTML += `
                <div class="cart-line-item">
                    <span>${item.product.name} (x${item.quantity})</span>
                    <strong>${item.totalPrice.toLocaleString('vi-VN')} VNĐ</strong>
                </div>`;
        });

        totalAmountElement.textContent =
            total.toLocaleString('vi-VN', { maximumFractionDigits: DECIMAL_PLACES }) + ' VNĐ';
    };

    // 📌 Submit tạo đơn hàng
     orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const items = Object.values(cart);
        if (!items.length) {
            displayMessage('Giỏ hàng trống.', 'error'); return;
        }

        const orderData = {
            customerName: document.getElementById('customerName').value,
            customerAddress: document.getElementById('customerAddress').value,
            orderDetails: items.map(i => ({
                productId: i.product.id,
                quantity: i.quantity,
                price: i.product.price
            }))
        };

        createOrderBtn.disabled = true;
        createOrderBtn.textContent = 'Đang xử lý...';

        try {
            const newOrder = await OrderService.createOrder(orderData);

            displayMessage('Tạo đơn hàng thành công! 🎉');

            const id = newOrder.orderId || newOrder.id;
            setTimeout(() => window.location.href = `orders.html?id=${id}`, 1200);

            orderForm.reset();
            cart = {};
            updateCartSummary();
            renderProductSelection();

        } catch (err) {
            displayMessage(`Lỗi: ${err.message}`, 'error');
        } finally {
            createOrderBtn.disabled = false;
            createOrderBtn.textContent = 'Tạo Đơn hàng';
        }
    });

    // 🚀 Khởi chạy
    loadProducts();
    updateCartSummary();
});
