using System;
using System.Collections.Generic;

namespace HeThongDonHangNho.Api.DTOs
{
    public class OrderDto
    {
        public int Id { get; set; }

        public int CustomerId { get; set; }

        // Thông tin khách hàng cho FE hiển thị
        public string? CustomerName { get; set; }
        public string? CustomerAddress { get; set; }

        public DateTime OrderDate { get; set; }

        public string Status { get; set; } = string.Empty;

        public decimal TotalAmount { get; set; }

        public List<OrderDetailDto> OrderDetails { get; set; } = new();
    }
}
