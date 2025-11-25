using System.Collections.Generic;

namespace HeThongDonHangNho.Api.DTOs
{
    public class OrderCreateDto
    {
        public int CustomerId { get; set; }
        public string ShippingAddress { get; set; }

        public List<OrderDetailCreateDto> OrderDetails { get; set; }
    }
}
