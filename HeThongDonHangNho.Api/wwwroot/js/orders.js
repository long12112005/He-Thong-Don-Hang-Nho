/**
 * js/orders.js
 * Logic xử lý trang Xem Danh sách Đơn hàng (orders.html)
 */

const LOGIN_PAGE = 'login.html';

document.addEventListener('DOMContentLoaded', () => {
    const ordersTableBody = document.getElementById('ordersTableBody');
    const loadingMsg = document.getElementById('loadingMsg');
    const modal = document.getElementById('orderDetailModal');
    const closeBtn = document.querySelector('.close-btn');
    const modalOrderId = document.getElementById('modalOrderId');
    const modalOrderInfo = document.getElementById('modalOrderInfo');
    const modalOrderDetailsBody = document.getElementById('modalOrderDetailsBody');

    // --- 1️⃣ Kiểm tra đăng nhập ---
    if (!AuthService.isLoggedIn()) {
        alert('⚠ Bạn cần đăng nhập để xem đơn hàng!');
        window.location.href = LOGIN_PAGE;
        return;
    }

    /**
     * 🔄 Tải danh sách đơn hàng của người dùng
     */
    const loadOrders = async () => {
        try {
            loadingMsg.textContent = '🔄 Đang tải danh sách đơn hàng...';
            const orders = await OrderService.getOrdersByUser();
            renderOrdersTable(orders);
        } catch (err) {
            loadingMsg.innerHTML = `<p style="color:red;">❌ Lỗi tải đơn hàng: ${err.message}</p>`;
        }
    };

    /**
     * 🧾 Render danh sách đơn hàng ra bảng
     */
    const renderOrdersTable = (orders) => {
        ordersTableBody.innerHTML = '';

        if (!orders || orders.length === 0) {
            ordersTableBody.innerHTML = `
                <tr><td colspan="5">⚠ Bạn chưa có đơn hàng nào.</td></tr>`;
            return;
        }

        orders.forEach(order => {
            const row = ordersTableBody.insertRow();

            const totalFormatted = (order.totalAmount ?? 0).toLocaleString('vi-VN');
            const dateFormatted = new Date(order.createdAt || order.createdDate)
                .toLocaleDateString('vi-VN');

            const status = order.status || 'Unknown';

            row.innerHTML = `
                <td>#${order.id}</td>
                <td>${dateFormatted}</td>
                <td><strong>${totalFormatted} VNĐ</strong></td>
                <td><span class="status status-${status.toLowerCase()}">${status}</span></td>
                <td><button class="btn-detail" data-id="${order.id}">Xem Chi tiết</button></td>
            `;
        });

        document.querySelectorAll('.btn-detail').forEach(btn => {
            btn.addEventListener('click', e => {
                const orderId = e.target.dataset.id;
                showOrderDetail(orderId);
            });
        });
    };

    /**
     * 📦 Hiển thị modal chi tiết đơn hàng
     */
    const showOrderDetail = async (orderId) => {
        modal.style.display = 'block';
        modalOrderId.textContent = `#${orderId}`;
        modalOrderInfo.innerHTML = '⏳ Đang tải...';
        modalOrderDetailsBody.innerHTML = '';

        try {
            const order = await OrderService.getOrderDetail(orderId);

            modalOrderInfo.innerHTML = `
                <p><strong>Khách:</strong> ${order.customerName || '—'}</p>
                <p><strong>Địa chỉ:</strong> ${order.customerAddress || '—'}</p>
                <p class="order-total-modal"><strong>Tổng giá trị:</strong>
                <span class="total-amount-value">${(order.totalAmount ?? 0).toLocaleString('vi-VN')} VNĐ</span></p>
            `;

            order.orderDetails.forEach(item => {
                const row = modalOrderDetailsBody.insertRow();

                row.innerHTML = `
                    <td>${item.productName}</td>
                    <td>${(item.price ?? 0).toLocaleString('vi-VN')} VNĐ</td>
                    <td>${item.quantity}</td>
                    <td>${(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ</td>
                `;
            });

        } catch (err) {
            modalOrderInfo.innerHTML = `<p style="color:red;">❌ Lỗi: ${err.message}</p>`;
        }
    };

    // 🛑 Đóng modal
    closeBtn.onclick = () => (modal.style.display = 'none');
    window.onclick = (e) => (e.target === modal ? modal.style.display = 'none' : null);

    // 🚀 Khởi động
    loadOrders();
});
