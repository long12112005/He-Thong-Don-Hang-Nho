/**
 * js/orders.js
 * Logic xử lý trang Xem Danh sách Đơn hàng (orders.html)
 */

const LOGIN_PAGE = 'login.html';
const ordersTableBody = document.getElementById('ordersTableBody');
const loadingMsg = document.getElementById('loadingMsg');
const modal = document.getElementById('orderDetailModal');
const closeBtn = document.querySelector('.close-btn');
const modalOrderId = document.getElementById('modalOrderId');
const modalOrderInfo = document.getElementById('modalOrderInfo');
const modalOrderDetailsBody = document.getElementById('modalOrderDetailsBody');

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. KIỂM TRA ĐĂNG NHẬP ---
    if (!AuthService.getToken()) {
        alert('Vui lòng đăng nhập để xem đơn hàng.');
        window.location.href = LOGIN_PAGE;
        return;
    }

    /**
     * Tải danh sách đơn hàng của người dùng hiện tại
     */
    const loadOrders = async () => {
        try {
            loadingMsg.textContent = 'Đang tải danh sách đơn hàng...';
            const orders = await OrderService.getOrdersByUser();
            renderOrdersTable(orders);
        } catch (error) {
            loadingMsg.innerHTML = `<p style="color: red;">Lỗi: Không thể tải đơn hàng. ${error.message}</p>`;
        }
    };

    /**
     * Hiển thị danh sách đơn hàng ra bảng
     */
    const renderOrdersTable = (orders) => {
        ordersTableBody.innerHTML = ''; // Xóa thông báo loading

        if (!orders || orders.length === 0) {
            ordersTableBody.innerHTML = '<tr><td colspan="5">Bạn chưa có đơn hàng nào.</td></tr>';
            return;
        }

        orders.forEach(order => {
            const row = ordersTableBody.insertRow();
            const totalFormatted = order.totalAmount ? order.totalAmount.toLocaleString('vi-VN') : 'N/A';
            const dateFormatted = new Date(order.orderDate || order.createdDate).toLocaleDateString('vi-VN');

            row.innerHTML = `
                <td>#${order.id}</td>
                <td>${dateFormatted}</td>
                <td><strong>${totalFormatted} VNĐ</strong></td>
                <td><span class="status-${order.status.toLowerCase()}">${order.status}</span></td>
                <td><button class="btn-detail" data-order-id="${order.id}">Xem Chi tiết</button></td>
            `;
        });
        
        // Gắn sự kiện click cho nút Xem Chi tiết
        document.querySelectorAll('.btn-detail').forEach(button => {
            button.addEventListener('click', (e) => showOrderDetail(e.target.dataset.orderId));
        });
    };

    /**
     * Hiển thị Modal chi tiết đơn hàng
     */
    const showOrderDetail = async (orderId) => {
        modalOrderId.textContent = `#${orderId}`;
        modalOrderInfo.innerHTML = 'Đang tải...';
        modalOrderDetailsBody.innerHTML = '';
        modal.style.display = 'block';

        try {
            const detail = await OrderService.getOrderDetail(orderId);

            // 1. Hiển thị thông tin khách hàng/tóm tắt
            const totalFormatted = detail.totalAmount ? detail.totalAmount.toLocaleString('vi-VN') : 'N/A';
            modalOrderInfo.innerHTML = `
                <p><strong>Tên khách hàng:</strong> ${detail.customerName}</p>
                <p><strong>Địa chỉ:</strong> ${detail.customerAddress}</p>
                <p class="order-total-modal"><strong>Tổng giá trị:</strong> <span class="total-amount-value">${totalFormatted} VNĐ</span></p>
            `;

            // 2. Hiển thị chi tiết sản phẩm (OrderDetails)
            detail.orderDetails.forEach(item => {
                const row = modalOrderDetailsBody.insertRow();
                const priceFormatted = item.price ? item.price.toLocaleString('vi-VN') : '0';
                const subTotal = (item.quantity * item.price) || 0;
                const subTotalFormatted = subTotal.toLocaleString('vi-VN');

                row.innerHTML = `
                    <td>${item.productName || 'Sản phẩm không rõ'}</td>
                    <td>${priceFormatted} VNĐ</td>
                    <td>${item.quantity}</td>
                    <td>${subTotalFormatted} VNĐ</td>
                `;
            });

        } catch (error) {
            modalOrderInfo.innerHTML = `<p style="color: red;">Lỗi tải chi tiết: ${error.message}</p>`;
        }
    };

    // --- Xử lý Modal ---
    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    // --- KHỞI ĐỘNG ---
    loadOrders();
});