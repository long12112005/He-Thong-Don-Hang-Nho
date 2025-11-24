namespace HeThongDonHangNho.Api.DTOs.Orders {
    public class CreateOrderDto {
        public int CustomerId { get; set; }
        public List<OrderItemDto> Items { get; set; } = new List<OrderItemDto>();
        public string ShippingAddress { get; set; }
    }

    public class OrderItemDto {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }
}