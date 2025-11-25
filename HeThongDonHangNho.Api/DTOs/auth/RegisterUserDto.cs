using System.ComponentModel.DataAnnotations;

namespace HeThongDonHangNho.Api.DTOs.auth
{
    public class RegisterUserDto
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(200)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Mật khẩu phải từ 6 ký tự trở lên.")]
        public string Password { get; set; } = string.Empty;

        // Nếu không muốn user tự set Admin thì có thể bỏ hẳn property này,
        // hoặc ép mặc định thành "User" rồi không bind từ client.
        [Required]
        [RegularExpression("Admin|User", ErrorMessage = "Role phải là 'Admin' hoặc 'User'.")]
        public string Role { get; set; } = "User";

        // Nếu có gắn với Customer
        public int? CustomerId { get; set; }
    }
}
