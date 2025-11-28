using System;
using System.Collections.Generic;

namespace HeThongDonHangNho.Api.DTOs
{
    public class OrderDto
    {
        public int Id { get; set; }

        public int CustomerId { get; set; }

        public string Status { get; set; }
        public string ShippingAddress { get; set; }

        public decimal TotalAmount { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public List<OrderDetailDto> OrderDetails { get; set; }
    }
}
