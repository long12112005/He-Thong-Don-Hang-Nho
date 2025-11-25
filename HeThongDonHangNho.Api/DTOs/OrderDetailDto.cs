namespace HeThongDonHangNho.Api.DTOs
{
    public class OrderDetailDto
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }

        // Có sẵn thành tiền từng item
        public decimal Total => Quantity * UnitPrice;
    }
}
