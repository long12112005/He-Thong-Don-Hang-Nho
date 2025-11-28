using System.ComponentModel.DataAnnotations;

namespace HeThongDonHangNho.Api.DTOs
{
    /// <summary>
    /// Dùng để cập nhật chi tiết đơn hàng (sản phẩm + số lượng).
    /// </summary>
    public class OrderDetailUpdateDto
    {
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Id phải > 0")]
        public int Id { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "ProductId phải > 0")]
        public int ProductId { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Số lượng phải > 0")]
        public int Quantity { get; set; }
    }
}
