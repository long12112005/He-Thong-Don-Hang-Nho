using System;

namespace HeThongDonHangNho.Api.Models
{
    public class OrderDetail
    {
        // Khóa chính cho từng dòng chi tiết
        public int Id { get; set; }

        // Mã đơn hàng (FK)
        public int OrderId { get; set; }
        public Order Order { get; set; } = null!;

        // Mã sản phẩm (FK)
        public int ProductId { get; set; }
        // Navigation tới Product để lấy tên sản phẩm
        public Product Product { get; set; } = null!;

        // Số lượng sản phẩm trong đơn hàng
        public int Quantity { get; set; }

        // Đơn giá tại thời điểm đặt hàng
        public decimal UnitPrice { get; set; }
    }
}
