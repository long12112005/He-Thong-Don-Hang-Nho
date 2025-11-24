namespace HeThongDonHangNho.Api.Models
{
    



public class Order 
{
public int Id { get; set; }
public int CustomerId { get; set; }
public int? UserId { get; set; }
public DateTime OrderDate { get; set; } = DateTime.UtcNow;
public decimal TotalAmount { get; set; }
public string Status { get; set; } = "Pending";
public string ShippingAddress { get; set; } = string.Empty;
public List<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
public DateTime? UpdatedAt { get; set; }
}
}