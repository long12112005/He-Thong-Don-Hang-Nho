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
     * 🧾 Render bảng danh sách đơn hàng
     */
    const renderOrdersTable = (orders) => {
        ordersTableBody.innerHTML = '';

        if (!orders || orders.length === 0) {
            loadingMsg.textContent = '';
            ordersTableBody.innerHTML =
                `<tr><td colspan="5">⚠ Bạn chưa có đơn hàng nào.</td></tr>`;
            return;
        }

        loadingMsg.textContent = '';

        orders.forEach(order => {
            const row = ordersTableBody.insertRow();

            const totalFormatted = (order.totalAmount ?? 0).toLocaleString('vi-VN');

            // Dùng đúng field OrderDate từ API
            const dateValue = order.orderDate;
            let dateFormatted = 'Không rõ';

            if (dateValue) {
                const dateObj = new Date(dateValue);
                if (!isNaN(dateObj.getTime())) {
                    dateFormatted = dateObj.toLocaleDateString('vi-VN');
                }
            }

            const status = order.status || 'Pending';

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
    // mở modal
    modal.style.display = 'block';
    modalOrderId.textContent = `#${orderId}`;
    modalOrderInfo.innerHTML = '⏳ Đang tải...';

    try {
        const order = await OrderService.getOrderDetail(orderId);

        // Tạo html danh sách sản phẩm + số lượng
        let productsHtml = '';

        if (order.orderDetails && order.orderDetails.length > 0) {
            productsHtml += `<p><strong>Sản phẩm & số lượng:</strong></p>`;
            productsHtml += `<ul class="order-items-list">`;

            order.orderDetails.forEach(item => {
                const name = item.productName || '';
                const qty = item.quantity ?? 0;

                productsHtml += `<li>${name} × ${qty}</li>`;
            });

            productsHtml += `</ul>`;
        } else {
            productsHtml += `<p><strong>Sản phẩm & số lượng:</strong> Không có sản phẩm nào.</p>`;
        }

        // Đổ vào modal
        modalOrderInfo.innerHTML = `
            <p><strong>Khách:</strong> ${order.customerName || '—'}</p>
            <p><strong>Địa chỉ:</strong> ${order.customerAddress || '—'}</p>
            <p class="order-total-modal">
                <strong>Tổng giá trị:</strong>
                <span class="total-amount-value">
                    ${(order.totalAmount ?? 0).toLocaleString('vi-VN')} VNĐ
                </span>
            </p>
            ${productsHtml}
        `;

    } catch (err) {
        modalOrderInfo.innerHTML = `<p style="color:red;">❌ Lỗi: ${err.message}</p>`;
    }
};




    // 🛑 Đóng modal
    closeBtn.onclick = () => (modal.style.display = 'none');
    window.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
    };

    // 🚀 Khởi động
    loadOrders();
});
