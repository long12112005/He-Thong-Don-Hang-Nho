namespace HeThongDonHangNho.Api.DTOs
{
    /// <summary>
    /// Dữ liệu trả về cho một dòng chi tiết đơn hàng.
    /// </summary>
    public class OrderDetailDto
    {
        public int Id { get; set; }

        public int OrderId { get; set; }

        public int ProductId { get; set; }

        // Tên sản phẩm để hiển thị ở FE
        public string? ProductName { get; set; }

        public int Quantity { get; set; }

        public decimal UnitPrice { get; set; }
    }
}
