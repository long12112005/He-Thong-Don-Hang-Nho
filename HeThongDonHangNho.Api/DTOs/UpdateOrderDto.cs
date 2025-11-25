using System;

namespace HeThongDonHangNho.Api.DTOs
{
    public class OrderUpdateDto
    {
        public int Id { get; set; }
        public string Status { get; set; }
        public string ShippingAddress { get; set; }
    }
}
