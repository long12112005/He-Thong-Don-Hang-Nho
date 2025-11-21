namespace HeThongDonHangNho.Api.Models
{
    public class Product
    {
        public int Id { get; set; }           // PK
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
