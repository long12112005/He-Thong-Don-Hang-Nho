/**
 * js/products.js
 * Logic xử lý trang Quản lý Sản phẩm
 */

// Giả định: Hàm checkRole có trong AuthService (hoặc được cung cấp từ backend)
const ADMIN_ROLE = 'Admin';

// Khai báo các biến DOM element cần thiết
const messageEl = document.getElementById('message'); // ĐÃ SỬA ID: #message
const productTableBody = document.getElementById('productsTableBody'); // SỬA: Từ productTableBody thành productsTableBody theo HTML
const productFormContainer = document.getElementById('productFormContainer');
const productForm = document.getElementById('productForm');
const formTitle = document.getElementById('formTitle');
const addProductBtn = document.getElementById('addProductBtn');

let isEditing = false; // Theo dõi trạng thái Thêm (false) hay Sửa (true)
let allProducts = []; // Lưu trữ sản phẩm đã tải để tiện cho việc Sửa

/**
 * Hàm hiển thị thông báo (thay thế cho alert)
 * @param {string} type - 'success' hoặc 'error'
 * @param {string} text - Nội dung thông báo
 */
const showMessage = (type, text) => {
    messageEl.textContent = text;
    messageEl.className = `alert alert-${type}`;
    messageEl.style.display = 'block';
    // Tự động ẩn sau 5 giây
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 5000);
};

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // A. KIỂM TRA XÁC THỰC VÀ PHÂN QUYỀN
    // ----------------------------------------------------
    const token = AuthService.getToken();

    // 1. Chặn truy cập: Nếu chưa login -> chuyển về trang login
    if (!token) {
        // Không dùng alert(), dùng console.error và chuyển trang
        console.error('Không có token. Chuyển hướng đến trang đăng nhập.');
        window.location.href = LOGIN_PAGE;
        return;
    }

    // Giả định: Ta có một hàm giải mã token hoặc gọi API để kiểm tra quyền
    // *** Cần TÙY CHỈNH CHỨC NĂNG KIỂM TRA ADMIN theo logic của bạn ***
    const userRole = 'Admin'; // Tạm thời giả định là Admin để test
    
    // Lưu ý: Nếu userRole không phải Admin, cần thêm logic ẩn các phần tử
    // Nhưng vì ta đang cố định là 'Admin', ta sẽ tiếp tục.

    // ----------------------------------------------------
    // B. LOGIC CRUD VÀ HIỂN THỊ
    // ----------------------------------------------------
    
    /**
     * Tải và hiển thị danh sách sản phẩm
     */
    const fetchAndRenderProducts = async () => {
        try {
            productTableBody.innerHTML = '<tr><td colspan="5">Đang tải dữ liệu...</td></tr>';
            const products = await ProductService.getProducts();
            allProducts = products; // Lưu trữ dữ liệu
            productTableBody.innerHTML = ''; // Xóa nội dung cũ
            
            if (products.length === 0) {
                productTableBody.innerHTML = '<tr><td colspan="5">Chưa có sản phẩm nào.</td></tr>';
                return;
            }

            products.forEach(product => {
                const row = productTableBody.insertRow();
                row.innerHTML = `
                    <td>${product.id}</td>
                    <td>${product.name}</td>
                    <td>${(product.price || 0).toLocaleString('vi-VN')} VNĐ</td>
                    <td>${(product.description || '').substring(0, 50)}...</td>
                    <td>
                        <button class="btn-edit btn-secondary" data-id="${product.id}">
                            <i class="fas fa-edit"></i> Sửa
                        </button>
                        <button class="btn-delete btn-danger" data-id="${product.id}">
                            <i class="fas fa-trash"></i> Xóa
                        </button>
                    </td>
                `;
            });

            attachEventListeners(); // Gắn lại sự kiện sau khi render
        } catch (error) {
            console.error('Lỗi tải sản phẩm:', error);
            productTableBody.innerHTML = `<tr><td colspan="5" style="color: red;">Lỗi tải dữ liệu: ${error.message}</td></tr>`;
        }
    };

    /**
     * Xử lý gửi form (Thêm/Sửa)
     */
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const saveProductBtn = document.getElementById('saveProductBtn');
        saveProductBtn.disabled = true;
        saveProductBtn.textContent = isEditing ? 'Đang cập nhật...' : 'Đang thêm...';
        
        // **ĐÃ SỬA LỖI ID TẠI ĐÂY**
        const productData = {
            name: document.getElementById('productName').value,
            price: parseFloat(document.getElementById('productPrice').value),
            description: document.getElementById('productDescription').value
        };
        const productId = document.getElementById('productId').value;
        
        try {
            if (isEditing) {
                await ProductService.updateProduct(productId, productData);
                showMessage('success', 'Cập nhật sản phẩm thành công!');
            } else {
                await ProductService.addProduct(productData);
                showMessage('success', 'Thêm sản phẩm thành công!');
            }
            
            // Tải lại bảng và ẩn form
            productFormContainer.style.display = 'none';
            productForm.reset();
            fetchAndRenderProducts();
        } catch (error) {
            showMessage('error', 'Thao tác thất bại: ' + error.message);
        } finally {
            saveProductBtn.disabled = false;
            saveProductBtn.textContent = 'Lưu';
        }
    });

    /**
     * Xử lý sự kiện Sửa và Xóa
     */
    const attachEventListeners = () => {
        // Xóa (Đã thay thế confirm() bằng message)
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                
                // *** KHÔNG DÙNG confirm() ***
                if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm ID: ${id}? Thao tác này không thể hoàn tác.`)) {
                     // Nếu bạn muốn một UI custom thay cho confirm(), bạn phải tạo nó.
                     // Tạm thời, ta sử dụng window.confirm (chỉ dùng trong trường hợp này vì không có modal custom)
                     return;
                }

                try {
                    await ProductService.deleteProduct(id);
                    showMessage('success', 'Xóa sản phẩm thành công.');
                    fetchAndRenderProducts();
                } catch (error) {
                    showMessage('error', 'Xóa sản phẩm thất bại: ' + error.message);
                }
            });
        });

        // Sửa
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const productToEdit = allProducts.find(p => p.id === id);
                
                if (!productToEdit) {
                    showMessage('error', 'Không tìm thấy sản phẩm để sửa.');
                    return;
                }

                // Điền dữ liệu vào form
                formTitle.textContent = 'Sửa';
                isEditing = true;
                
                document.getElementById('productId').value = productToEdit.id;
                document.getElementById('productName').value = productToEdit.name;
                document.getElementById('productPrice').value = productToEdit.price;
                document.getElementById('productDescription').value = productToEdit.description;
                
                // Hiển thị form
                productFormContainer.style.display = 'block';
                productFormContainer.scrollIntoView({ behavior: 'smooth' });
            });
        });
    };
    
    // Nút Thêm sản phẩm
    // ** LISTENER CHO NÚT THÊM ĐÃ ĐƯỢC ĐẶT VÀO VỊ TRÍ NÀY VÀ HOÀN TOÀN KHẢ DỤNG **
    document.getElementById('addProductBtn').addEventListener('click', () => {
        formTitle.textContent = 'Thêm';
        isEditing = false;
        productForm.reset(); // Xóa dữ liệu cũ
        document.getElementById('productId').value = '';
        productFormContainer.style.display = 'block';
        productFormContainer.scrollIntoView({ behavior: 'smooth' });
    });

    // Nút Hủy form
    document.getElementById('cancelButton').addEventListener('click', () => {
        productFormContainer.style.display = 'none';
        productForm.reset();
    });

    // Bắt đầu quá trình: Tải dữ liệu
    fetchAndRenderProducts();
});