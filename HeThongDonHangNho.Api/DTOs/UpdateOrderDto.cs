using System;
using System.ComponentModel.DataAnnotations;

namespace HeThongDonHangNho.Api.DTOs
{
    public class OrderUpdateDto
    {
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Id phải > 0")]
        public int Id { get; set; }

        [Required]
        [StringLength(50, ErrorMessage = "Trạng thái tối đa 50 ký tự")]
        public string Status { get; set; } = string.Empty;

        [Required]
        [StringLength(500, ErrorMessage = "Địa chỉ giao hàng tối đa 500 ký tự")]
        public string ShippingAddress { get; set; } = string.Empty;
    }
}
