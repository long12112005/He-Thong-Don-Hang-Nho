using System.ComponentModel.DataAnnotations;

namespace HeThongDonHangNho.Api.DTOs
{
    /// <summary>
    /// Dùng để cập nhật trạng thái đơn hàng.
    /// </summary>
    public class OrderUpdateDto
    {
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Id phải > 0")]
        public int Id { get; set; }

        [Required]
        [StringLength(50, ErrorMessage = "Trạng thái tối đa 50 ký tự")]
        public string Status { get; set; } = string.Empty;
    }
}
