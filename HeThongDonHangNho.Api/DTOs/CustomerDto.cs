namespace HeThongDonHangNho.Api.Dtos.Customers
{
    public class CustomerDto
    {
        public int Id { get; set; }            
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? Address { get; set; }
    }
}
