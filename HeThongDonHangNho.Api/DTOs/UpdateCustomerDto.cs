using System.ComponentModel.DataAnnotations;

namespace HeThongDonHangNho.Api.Dtos.Customers
{
    public class UpdateCustomerDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Phone]
        [StringLength(20)]
        public string Phone { get; set; } = string.Empty;

        public string? Address { get; set; }

    
        [Required]
        [EmailAddress]
        [StringLength(200)]
        public string Email { get; set; } = string.Empty;

    }
}
