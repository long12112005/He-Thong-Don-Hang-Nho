using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HeThongDonHangNho.Api.DTOs
{
    /// <summary>
    /// Dùng khi tạo mới đơn hàng.
    /// - Admin: bắt buộc truyền CustomerId hợp lệ.
    /// - User: có thể bỏ trống, backend sẽ lấy CustomerId gắn với tài khoản.
    /// </summary>
    public class CreateOrderDto
    {
        public int? CustomerId { get; set; }

        [Required(ErrorMessage = "Đơn hàng phải có ít nhất 1 sản phẩm.")]
        [MinLength(1, ErrorMessage = "Đơn hàng phải có ít nhất 1 sản phẩm.")]
        public List<CreateOrderDetailDto> OrderDetails { get; set; } = new();
    }
}
