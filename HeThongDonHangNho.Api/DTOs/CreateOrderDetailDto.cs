using System.ComponentModel.DataAnnotations;

namespace HeThongDonHangNho.Api.DTOs
{
    public class OrderDetailCreateDto
    {
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "OrderId phải > 0")]
        public int OrderId { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "ProductId phải > 0")]
        public int ProductId { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Số lượng phải > 0")]
        public int Quantity { get; set; }

        // UnitPrice thực tế đang không dùng ở controller (lấy từ Product.Price),
        // nhưng giữ lại cũng không sao
        [Range(0, double.MaxValue, ErrorMessage = "Đơn giá phải >= 0")]
        public decimal UnitPrice { get; set; }
    }
}
