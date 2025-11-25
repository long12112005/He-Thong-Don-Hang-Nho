namespace HeThongDonHangNho.Api.DTOs
{
    public class OrderDetailUpdateDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}
