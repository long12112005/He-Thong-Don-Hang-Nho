/**
 * js/order.js
 * Logic xử lý trang Tạo Đơn hàng (Giỏ hàng)
 */

const LOGIN_PAGE = 'login.html';
const DECIMAL_PLACES = 0; // Số chữ số thập phân cho giá tiền

// Biến lưu trữ sản phẩm có sẵn và sản phẩm trong giỏ hàng
let availableProducts = [];
let cart = {}; // { productId: { product, quantity, totalPrice } }

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. KIỂM TRA ĐĂNG NHẬP VÀ LOAD DỮ LIỆU ---
    
    if (!AuthService.getToken()) {
        alert('Vui lòng đăng nhập để tạo đơn hàng.');
        window.location.href = LOGIN_PAGE;
        return;
    }

    const productListElement = document.getElementById('productList');
    const cartItemsElement = document.getElementById('cartItems');
    const totalAmountElement = document.getElementById('totalAmount');
    const createOrderBtn = document.getElementById('createOrderBtn');
    const orderForm = document.getElementById('orderForm');
    const messageElement = document.getElementById('message');

    /**
     * Tải danh sách sản phẩm có sẵn từ API
     */
    const loadProducts = async () => {
        try {
            const products = await ProductService.getProducts(); // Dùng ProductService đã tạo
            availableProducts = products.reduce((map, product) => {
                map[product.id] = product;
                return map;
            }, {});
            renderProductSelection();
        } catch (error) {
            productListElement.innerHTML = `<p style="color: red;">Lỗi: Không thể tải sản phẩm. ${error.message}</p>`;
        }
    };

    /**
     * Hiển thị danh sách sản phẩm để người dùng chọn
     */
    const renderProductSelection = () => {
        const productIds = Object.keys(availableProducts);
        document.getElementById('loadingMsg').style.display = 'none';

        if (productIds.length === 0) {
            productListElement.innerHTML = '<p>Không có sản phẩm nào để chọn.</p>';
            return;
        }

        productListElement.innerHTML = productIds.map(id => {
            const product = availableProducts[id];
            const priceFormatted = product.price ? product.price.toLocaleString('vi-VN') : '0';
            return `
                <div class="product-item">
                    <h4>${product.name}</h4>
                    <p>Giá: ${priceFormatted} VNĐ</p>
                    <label>Số lượng:</label>
                    <input type="number" min="0" value="${cart[id] ? cart[id].quantity : 0}" 
                           data-product-id="${id}" class="quantity-input">
                </div>
            `;
        }).join('');

        // Gắn sự kiện thay đổi số lượng
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', handleQuantityChange);
        });
    };

    /**
     * Cập nhật giỏ hàng và tổng tiền
     */
    const updateCartSummary = () => {
        let total = 0;
        let itemCount = 0;
        cartItemsElement.innerHTML = '';
        
        const cartKeys = Object.keys(cart);

        if (cartKeys.length === 0) {
            document.getElementById('emptyCartMsg').style.display = 'block';
            createOrderBtn.disabled = true;
            totalAmountElement.textContent = '0 VNĐ';
            return;
        }

        document.getElementById('emptyCartMsg').style.display = 'none';

        // Hiển thị chi tiết giỏ hàng
        cartKeys.forEach(id => {
            const item = cart[id];
            total += item.totalPrice;
            itemCount++;

            const priceFormatted = item.product.price ? item.product.price.toLocaleString('vi-VN') : '0';
            const totalFormatted = item.totalPrice.toLocaleString('vi-VN');

            cartItemsElement.innerHTML += `
                <div class="cart-line-item">
                    <span>${item.product.name} (x${item.quantity})</span>
                    <strong>${totalFormatted} VNĐ</strong>
                    <p style="font-size: 0.8em; color: #777;">Đơn giá: ${priceFormatted} VNĐ</p>
                </div>
            `;
        });

        // Cập nhật tổng tiền và trạng thái nút
        totalAmountElement.textContent = total.toLocaleString('vi-VN', {
             maximumFractionDigits: DECIMAL_PLACES 
        }) + ' VNĐ';
        createOrderBtn.disabled = itemCount === 0;
    };

    /**
     * Xử lý khi người dùng thay đổi số lượng sản phẩm
     */
    const handleQuantityChange = (event) => {
        const productId = event.target.dataset.productId;
        let quantity = parseInt(event.target.value);

        if (isNaN(quantity) || quantity < 0) {
            quantity = 0;
        }
        event.target.value = quantity; // Chuẩn hóa giá trị hiển thị

        const product = availableProducts[productId];

        if (quantity > 0) {
            cart[productId] = {
                product: product,
                quantity: quantity,
                totalPrice: product.price * quantity 
            };
        } else {
            delete cart[productId];
        }

        updateCartSummary();
    };
    
    /**
     * Hiển thị thông báo (Thành công/Thất bại)
     */
    const displayMessage = (text, type = 'success') => {
        messageElement.textContent = text;
        messageElement.className = `alert alert-${type}`;
        messageElement.style.display = 'block';
        
        // Tự động ẩn sau 5 giây
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 5000);
    };

    /**
     * Xử lý tạo đơn hàng
     */
    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Kiểm tra giỏ hàng
        const cartItemsArray = Object.values(cart);
        if (cartItemsArray.length === 0) {
            displayMessage('Giỏ hàng trống. Vui lòng chọn sản phẩm.', 'error');
            return;
        }

        // 2. Chuẩn bị dữ liệu OrderDetail
        const orderDetails = cartItemsArray.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price // Lưu giá tại thời điểm tạo đơn hàng
        }));

        // 3. Chuẩn bị dữ liệu Order chính
        const orderData = {
            customerName: document.getElementById('customerName').value,
            customerAddress: document.getElementById('customerAddress').value,
            orderDetails: orderDetails,
            // Thêm các trường khác như totalAmount (nếu backend yêu cầu)
            // totalAmount: cartItemsArray.reduce((acc, item) => acc + item.totalPrice, 0)
        };
        
        createOrderBtn.disabled = true;
        createOrderBtn.textContent = 'Đang tạo đơn...';

        try {
            // 4. Gửi request tạo đơn hàng kèm JWT Token
            const newOrder = await OrderService.createOrder(orderData);
            
            // 5. Xử lý thành công
            displayMessage(`Tạo đơn hàng thành công! Mã đơn: ${newOrder.orderId || newOrder.id}`, 'success');
            
            // Chuyển hướng sang trang chi tiết (ví dụ)
            // setTimeout(() => {
            //     window.location.href = `order_detail.html?id=${newOrder.orderId}`;
            // }, 2000);

            // Reset form và giỏ hàng sau khi tạo thành công
            orderForm.reset();
            cart = {};
            updateCartSummary();
            renderProductSelection();

        } catch (error) {
            displayMessage(`Tạo đơn hàng thất bại: ${error.message}`, 'error');
        } finally {
            createOrderBtn.disabled = false;
            createOrderBtn.textContent = 'Tạo Đơn hàng';
        }
    });

    // --- 2. KHỞI ĐỘNG ---
    loadProducts();
    updateCartSummary(); // Hiển thị trạng thái giỏ hàng ban đầu
});