/**
 * js/products.js
 * Logic xử lý trang Quản lý Sản phẩm
 */

// Giả định: Hàm checkRole có trong AuthService (hoặc được cung cấp từ backend)
// Ví dụ: AuthService.getRole() trả về 'Admin' hoặc 'User'
const ADMIN_ROLE = 'Admin';
const LOGIN_PAGE = 'login.html';

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // A. KIỂM TRA XÁC THỰC VÀ PHÂN QUYỀN
    // ----------------------------------------------------
    const token = AuthService.getToken();
    const authMessage = document.getElementById('authMessage');

    // 1. Chặn truy cập: Nếu chưa login -> chuyển về trang login
    if (!token) {
        alert('Vui lòng đăng nhập để truy cập trang quản lý.');
        window.location.href = LOGIN_PAGE;
        return;
    }

    // Giả định: Ta có một hàm giải mã token hoặc gọi API để kiểm tra quyền
    // *** Cần TÙY CHỈNH CHỨC NĂNG KIỂM TRA ADMIN theo logic của bạn ***
    const userRole = 'Admin'; // Tạm thời giả định là Admin để test

    // 2. Chặn truy cập: Nếu không phải Admin -> hiển thị thông báo
    if (userRole !== ADMIN_ROLE) {
        authMessage.textContent = '⛔ Không có quyền truy cập. Bạn phải là Quản trị viên.';
        // Ẩn toàn bộ nội dung quản lý
        document.getElementById('productTable').style.display = 'none';
        document.getElementById('addProductBtn').style.display = 'none';
        return;
    }

    // Nếu là Admin hợp lệ: Hiển thị giao diện và tải dữ liệu
    authMessage.style.display = 'none';
    document.getElementById('productTable').style.display = 'table';
    document.getElementById('addProductBtn').style.display = 'block';
    
    // ----------------------------------------------------
    // B. LOGIC CRUD VÀ HIỂN THỊ
    // ----------------------------------------------------
    const productTableBody = document.getElementById('productTableBody');
    const productFormContainer = document.getElementById('productFormContainer');
    const productForm = document.getElementById('productForm');
    const formTitle = document.getElementById('formTitle');
    
    let isEditing = false; // Theo dõi trạng thái Thêm (false) hay Sửa (true)

    /**
     * Tải và hiển thị danh sách sản phẩm
     */
    const fetchAndRenderProducts = async () => {
        try {
            const products = await ProductService.getProducts();
            productTableBody.innerHTML = ''; // Xóa nội dung cũ
            
            products.forEach(product => {
                const row = productTableBody.insertRow();
                row.innerHTML = `
                    <td>${product.id}</td>
                    <td>${product.name}</td>
                    <td>${product.price.toLocaleString('vi-VN')} VNĐ</td>
                    <td>${product.description.substring(0, 50)}...</td>
                    <td>
                        <button class="btn-edit" data-id="${product.id}">Sửa</button>
                        <button class="btn-delete" data-id="${product.id}">Xóa</button>
                    </td>
                `;
            });

            attachEventListeners(); // Gắn lại sự kiện sau khi render
        } catch (error) {
            console.error('Lỗi tải sản phẩm:', error);
            // Nếu lỗi là do Unauthorized/Forbidden, thông báo cho người dùng
            if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
                 // Đã xử lý ở bước A, nhưng phòng hờ nếu token hết hạn
                 alert('Phiên làm việc đã hết hạn hoặc không có quyền. Vui lòng đăng nhập lại.');
                 window.location.href = LOGIN_PAGE;
            } else {
                 authMessage.textContent = `Lỗi: ${error.message}`;
            }
        }
    };

    /**
     * Xử lý gửi form (Thêm/Sửa)
     */
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const productData = {
            name: document.getElementById('name').value,
            price: parseFloat(document.getElementById('price').value),
            description: document.getElementById('description').value
        };
        const productId = document.getElementById('productId').value;
        
        try {
            if (isEditing) {
                await ProductService.updateProduct(productId, productData);
                alert('Cập nhật sản phẩm thành công!');
            } else {
                await ProductService.addProduct(productData);
                alert('Thêm sản phẩm thành công!');
            }
            
            // Tải lại bảng và ẩn form
            productFormContainer.style.display = 'none';
            fetchAndRenderProducts();
        } catch (error) {
            alert('Thao tác thất bại: ' + error.message);
        }
    });

    /**
     * Xử lý sự kiện Sửa và Xóa
     */
    const attachEventListeners = () => {
        // Xóa
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm ID: ${id}?`)) {
                    try {
                        await ProductService.deleteProduct(id);
                        alert('Xóa sản phẩm thành công.');
                        fetchAndRenderProducts();
                    } catch (error) {
                        alert('Xóa sản phẩm thất bại: ' + error.message);
                    }
                }
            });
        });

        // Sửa
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                // Tìm dữ liệu sản phẩm tương ứng (cần phải lưu trữ products global hoặc gọi API)
                // *** GIẢ ĐỊNH DỮ LIỆU ĐÃ ĐƯỢC LOAD ***
                
                // Hiện form và điền dữ liệu
                formTitle.textContent = 'Sửa';
                isEditing = true;
                productFormContainer.style.display = 'block';
                
                // Tạm thời chỉ điền ID, bạn cần bổ sung logic điền các trường khác
                document.getElementById('productId').value = id;
                // Ví dụ: document.getElementById('name').value = productToEdit.name; 
            });
        });
    };
    
    // Nút Thêm sản phẩm
    document.getElementById('addProductBtn').addEventListener('click', () => {
        formTitle.textContent = 'Thêm';
        isEditing = false;
        productForm.reset(); // Xóa dữ liệu cũ
        document.getElementById('productId').value = '';
        productFormContainer.style.display = 'block';
    });

    // Nút Hủy form
    document.getElementById('cancelButton').addEventListener('click', () => {
        productFormContainer.style.display = 'none';
    });

    // Bắt đầu quá trình: Kiểm tra và tải dữ liệu
    fetchAndRenderProducts();
});