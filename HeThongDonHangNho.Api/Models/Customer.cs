namespace HeThongDonHangNho.Api.Models
{
    public class Customer
    {
        public int Id { get; set; }           

        public string Name { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        // Email khách hàng
        public string Email { get; set; } = string.Empty;

        public string? Address { get; set; }
    }
}
