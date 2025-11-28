using System.ComponentModel.DataAnnotations;

namespace HeThongDonHangNho.Api.DTOs
{
    
    public class CreateOrderDetailDto
    {
        public int? OrderId { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "ProductId phải > 0")]
        public int ProductId { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Số lượng phải > 0")]
        public int Quantity { get; set; }
    }
}
