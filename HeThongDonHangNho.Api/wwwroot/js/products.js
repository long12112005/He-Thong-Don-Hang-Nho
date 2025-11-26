/**
 * js/products.js
 * Logic xử lý trang Quản lý Sản phẩm
 */

const ADMIN_ROLE = 'Admin';

// DOM Elements
const messageEl = document.getElementById('message');
const productTableBody = document.getElementById('productsTableBody');
const productFormContainer = document.getElementById('productFormContainer');
const productForm = document.getElementById('productForm');
const formTitle = document.getElementById('formTitle');
const addProductBtn = document.getElementById('addProductBtn');

let isEditing = false;
let allProducts = [];

/*-------------------------*
 | HIỂN THỊ THÔNG BÁO UI  |
 *-------------------------*/
const showMessage = (type, text) => {
    messageEl.textContent = text;
    messageEl.className = `alert alert-${type}`;
    messageEl.style.display = 'block';
    setTimeout(() => (messageEl.style.display = 'none'), 5000);
};

/*-------------------------*
 | KIỂM TRA QUYỀN ADMIN   |
 *-------------------------*/
const validateAuthentication = () => {
    const token = AuthService.getToken();

    // 1. Chưa đăng nhập → chặn + chuyển login
    if (!token) {
        messageEl.style.display = 'block';
        messageEl.className = 'alert alert-error';
        messageEl.textContent = 'Bạn cần đăng nhập để truy cập trang này.';
        setTimeout(() => (window.location.href = LOGIN_PAGE), 2000);
        return false;
    }

    // 2. Lấy thông tin user từ localStorage
    const user = AuthService.getUser();

    if (!user) {
        messageEl.style.display = 'block';
        messageEl.className = 'alert alert-error';
        messageEl.textContent = 'Không thể xác thực người dùng.';
        return false;
    }

    // 3. Không phải Admin → chặn toàn bộ giao diện
    if (user.role !== ADMIN_ROLE) {
        document.body.innerHTML = `
            <div style="margin: 50px auto; max-width: 600px; text-align: center;">
                <h2 style="color: red;">⛔ Truy cập bị từ chối</h2>
                <p>Bạn không có quyền Admin để truy cập trang này.</p>
            </div>
        `;
        return false;
    }

    return true; // OK → được phép truy cập
};

/*-------------------------*
 | TẢI & HIỂN THỊ SP       |
 *-------------------------*/
const fetchAndRenderProducts = async () => {
    try {
        productTableBody.innerHTML = '<tr><td colspan="5">Đang tải dữ liệu...</td></tr>';

        const products = await ProductService.getProducts();
        allProducts = products;

        productTableBody.innerHTML = '';

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

        attachEventListeners();
    } catch (error) {
        console.error('Lỗi tải sản phẩm:', error);
        productTableBody.innerHTML =
            `<tr><td colspan="5" style="color: red;">Lỗi tải dữ liệu: ${error.message}</td></tr>`;
    }
};

/*-------------------------*
 | CRUD SẢN PHẨM           |
 *-------------------------*/
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const saveBtn = document.getElementById('saveProductBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = isEditing ? 'Đang cập nhật...' : 'Đang thêm...';

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

        productFormContainer.style.display = 'none';
        productForm.reset();
        fetchAndRenderProducts();
    } catch (error) {
        showMessage('error', 'Thao tác thất bại: ' + error.message);
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Lưu';
    }
});

/*-------------------------*
 | SỰ KIỆN EDIT + DELETE   |
 *-------------------------*/
const attachEventListeners = () => {
    // DELETE
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.dataset.id;
            if (!window.confirm(`Xóa sản phẩm ID ${id}?`)) return;

            try {
                await ProductService.deleteProduct(id);
                showMessage('success', 'Xóa sản phẩm thành công.');
                fetchAndRenderProducts();
            } catch (error) {
                showMessage('error', 'Xóa thất bại: ' + error.message);
            }
        });
    });

    // EDIT
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const product = allProducts.find(p => p.id === id);

            if (!product) {
                showMessage('error', 'Không tìm thấy sản phẩm.');
                return;
            }

            formTitle.textContent = 'Sửa';
            isEditing = true;

            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productDescription').value = product.description;

            productFormContainer.style.display = 'block';
            productFormContainer.scrollIntoView({ behavior: 'smooth' });
        });
    });
};

/*-------------------------*
 | BUTTON THÊM + HỦY        |
 *-------------------------*/
addProductBtn.addEventListener('click', () => {
    formTitle.textContent = 'Thêm';
    isEditing = false;
    productForm.reset();
    document.getElementById('productId').value = '';
    productFormContainer.style.display = 'block';
    productFormContainer.scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('cancelButton').addEventListener('click', () => {
    productFormContainer.style.display = 'none';
    productForm.reset();
});

/*-------------------------*
 | CHẠY LÚC LOAD TRANG     |
 *-------------------------*/
document.addEventListener('DOMContentLoaded', () => {
    if (!validateAuthentication()) return; // ❌ nếu fail → dừng toàn bộ
    fetchAndRenderProducts(); // OK → load sản phẩm
});
