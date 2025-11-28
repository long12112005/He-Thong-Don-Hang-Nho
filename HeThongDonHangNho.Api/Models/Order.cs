using System;
using System.Collections.Generic;

namespace HeThongDonHangNho.Api.Models
{
    
    public class Order
    {
        // Khóa chính đơn hàng
        public int Id { get; set; }

        // Khóa ngoại tới khách hàng đặt đơn
        public int CustomerId { get; set; }

        // Ngày tạo đơn hàng
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        // Trạng thái đơn (Pending, Completed, Cancelled, ...)
        public string Status { get; set; } = "Pending";

        // Tổng tiền của đơn hàng
        public decimal TotalAmount { get; set; }

        // Navigation properties (phục vụ ORM, không phải field nghiệp vụ thêm)
        public Customer Customer { get; set; } = null!;
        public List<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
    }
}
