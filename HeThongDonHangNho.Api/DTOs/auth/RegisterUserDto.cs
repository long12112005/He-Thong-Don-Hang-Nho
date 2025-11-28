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

        // Cho phép Admin hoặc User
        [Required]
        [RegularExpression("Admin|User", ErrorMessage = "Role phải là 'Admin' hoặc 'User'.")]
        public string Role { get; set; } = "User";

        // Nếu là User có thể gắn với CustomerId
        public int? CustomerId { get; set; }
    }
}
