using System.ComponentModel.DataAnnotations;

namespace HeThongDonHangNho.Api.Dtos.Products
{
    public class UpdateProductDto
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = null!;

        public string? Description { get; set; }

        [Range(0, 999999999)]
        public decimal Price { get; set; }

        [Range(0, int.MaxValue)]
        public int Stock { get; set; }

        public bool IsActive { get; set; }
    }
}
