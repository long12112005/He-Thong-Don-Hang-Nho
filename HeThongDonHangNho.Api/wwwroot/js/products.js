/**
 * js/products.js
 * Logic xử lý trang Quản lý Sản phẩm (Admin Only)
 */

const LOGIN_PAGE = 'login.html';
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
 |  HIỂN THỊ THÔNG BÁO     |
 *-------------------------*/
const showMessage = (type, text) => {
    messageEl.textContent = text;
    messageEl.className = `alert alert-${type}`;
    messageEl.style.display = 'block';
    setTimeout(() => (messageEl.style.display = 'none'), 4000);
};

/*-------------------------*
 | KIỂM TRA TOKEN & ROLE   |
 *-------------------------*/
const validateAuthentication = () => {
    const token = AuthService.getToken();

    if (!token) {
        alert('Bạn cần đăng nhập để truy cập trang này.');
        window.location.href = LOGIN_PAGE;
        return false;
    }

    const user = AuthService.getUser();
    if (!user) {
        showMessage('error', 'Không xác thực được người dùng.');
        return false;
    }

    if (user.role !== ADMIN_ROLE) {
        document.body.innerHTML = `
            <div style="margin:50px auto;max-width:650px;text-align:center;">
                <h2 style="color:red;">⛔ Truy cập bị từ chối</h2>
                <p>Chỉ Admin mới có quyền quản lý sản phẩm.</p>
            </div>`;
        return false;
    }

    return true;
};

/*-------------------------*
 | LOAD & RENDER PRODUCTS  |
 *-------------------------*/
const fetchAndRenderProducts = async () => {
    try {
        productTableBody.innerHTML = `<tr><td colspan="5">Đang tải dữ liệu...</td></tr>`;

        const products = await ProductService.getProducts();
        allProducts = products;

        if (!products.length) {
            productTableBody.innerHTML = `<tr><td colspan="5">Chưa có sản phẩm nào.</td></tr>`;
            return;
        }

        productTableBody.innerHTML = '';
        products.forEach(product => {
            const row = productTableBody.insertRow();
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${(product.price || 0).toLocaleString('vi-VN')} VNĐ</td>
                <td>${(product.description || '').substring(0, 60)}...</td>
                <td>
                    <button class="btn-edit btn-secondary" data-id="${product.id}">✏ Sửa</button>
                    <button class="btn-delete btn-danger" data-id="${product.id}">🗑 Xóa</button>
                </td>
            `;
        });

        attachEventListeners();
    } catch (err) {
        productTableBody.innerHTML =
            `<tr><td colspan="5" style="color:red;">Lỗi tải dữ liệu: ${err.message}</td></tr>`;
    }
};

/*-------------------------*
 | ADD & UPDATE PRODUCT    |
 *-------------------------*/
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const saveBtn = document.getElementById('saveProductBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = isEditing ? 'Đang cập nhật...' : 'Đang thêm...';

    const productId = document.getElementById('productId').value;
    const data = {
        name: document.getElementById('productName').value,
        price: Number(document.getElementById('productPrice').value),
        description: document.getElementById('productDescription').value
    };

    try {
        if (isEditing) {
            await ProductService.updateProduct(productId, data);
            showMessage('success', 'Đã cập nhật sản phẩm ✔');
        } else {
            await ProductService.addProduct(data);
            showMessage('success', 'Đã thêm sản phẩm ✔');
        }

        productFormContainer.style.display = 'none';
        productForm.reset();
        fetchAndRenderProducts();
    } catch (err) {
        showMessage('error', 'Thao tác thất bại: ' + err.message);
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Lưu';
    }
});

/*-------------------------*
 | EDIT & DELETE BUTTONS   |
 *-------------------------*/
const attachEventListeners = () => {
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            if (!confirm(`Xóa sản phẩm ID ${id}?`)) return;
            try {
                await ProductService.deleteProduct(id);
                showMessage('success', 'Đã xóa sản phẩm ✔');
                fetchAndRenderProducts();
            } catch (err) {
                showMessage('error', 'Xóa thất bại: ' + err.message);
            }
        });
    });

    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const product = allProducts.find(p => p.id == id);
            if (!product) return;

            isEditing = true;
            formTitle.textContent = 'Sửa Sản phẩm';

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
 | BUTTON: THÊM & HỦY      |
 *-------------------------*/
addProductBtn.addEventListener('click', () => {
    isEditing = false;
    formTitle.textContent = 'Thêm Sản phẩm';
    productForm.reset();
    document.getElementById('productId').value = '';
    productFormContainer.style.display = 'block';
});

document.getElementById('cancelButton').addEventListener('click', () => {
    productForm.reset();
    productFormContainer.style.display = 'none';
});

/*-------------------------*
 | INIT WHEN PAGE LOAD     |
 *-------------------------*/
document.addEventListener('DOMContentLoaded', () => {
    if (!validateAuthentication()) return;
    fetchAndRenderProducts();
});
