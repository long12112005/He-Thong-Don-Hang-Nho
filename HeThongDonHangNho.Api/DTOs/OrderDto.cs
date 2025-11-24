namespace HeThongDonHangNho.Api.DTOs.Orders {
public class OrderDto {
public int Id { get; set; }
public int CustomerId { get; set; }
public DateTime OrderDate { get; set; }
public decimal TotalAmount { get; set; }
public List<OrderDetailDto> Items { get; set; } = new List<OrderDetailDto>();
}


public class OrderDetailDto {
public int ProductId { get; set; }
public string ProductName { get; set; }
public int Quantity { get; set; }
public decimal UnitPrice { get; set; }
public decimal LineTotal { get; set; }
}
}