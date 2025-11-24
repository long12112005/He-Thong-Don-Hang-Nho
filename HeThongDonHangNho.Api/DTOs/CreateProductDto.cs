namespace HeThongDonHangNho.Api.Dtos.Products
{
    public class CreateProductDto
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = null!;

        public string? Description { get; set; }

        [Range(0, 999999999)]
        public decimal Price { get; set; }

        [Range(0, int.MaxValue)]
        public int Stock { get; set; }
    }
}
