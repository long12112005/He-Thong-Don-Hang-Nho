using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;
using System.Text;

namespace HeThongDonHangNho.Api.Models
{
   public class User
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string Role { get; set; } = "User";   // "Admin" hoặc "User"

    public int? CustomerId { get; set; }
    public Customer? Customer { get; set; }

    public void SetPassword(string password)
    {
        PasswordHash = HashPassword(password);
    }

    public bool VerifyPassword(string password)
    {
        return PasswordHash == HashPassword(password);
    }

    private static string HashPassword(string password)
    {
        using var sha = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(password);
        var hash = sha.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }
}

}
