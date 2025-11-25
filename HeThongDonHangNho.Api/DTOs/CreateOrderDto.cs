using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HeThongDonHangNho.Api.DTOs
{
    public class OrderCreateDto
    {
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "CustomerId phải > 0")]
        public int CustomerId { get; set; }

        [Required]
        [StringLength(500, ErrorMessage = "Địa chỉ giao hàng tối đa 500 ký tự")]
        public string ShippingAddress { get; set; } = string.Empty;

        [Required(ErrorMessage = "Đơn hàng phải có ít nhất 1 sản phẩm.")]
        [MinLength(1, ErrorMessage = "Đơn hàng phải có ít nhất 1 sản phẩm.")]
        public List<OrderDetailCreateDto> OrderDetails { get; set; } = new();
    }
}
