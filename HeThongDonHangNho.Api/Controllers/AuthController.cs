using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HeThongDonHangNho.Api.Data;
using HeThongDonHangNho.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using HeThongDonHangNho.Api.DTOs.auth;

namespace HeThongDonHangNho.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(ApplicationDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // ========== REGISTER ==========
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterUserDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var exists = await _context.Users.AnyAsync(u => u.Email == dto.Email);
            if (exists)
                return BadRequest(new { message = "Email đã được sử dụng" });

            // Chuẩn hóa role: chỉ chấp nhận Admin / User
            var role = (dto.Role ?? "User").Trim();
            if (role != "Admin" && role != "User")
            {
                role = "User";
            }

            // Nếu là Admin thì không gắn CustomerId
            int? customerId = role == "Admin" ? null : dto.CustomerId;

            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                Role = role,
                CustomerId = customerId
            };
            user.SetPassword(dto.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Tạo tài khoản thành công",
                user.Id,
                user.Name,
                user.Email,
                user.Role,
                user.CustomerId
            });
        }

        // ========== LOGIN ==========
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null || !user.VerifyPassword(dto.Password))
                return Unauthorized(new { message = "Email hoặc mật khẩu không đúng" });

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                token,
                userId = user.Id,
                name = user.Name,
                email = user.Email,
                role = user.Role,
                customerId = user.CustomerId   // <<< TRẢ THÊM CHO FE
            });
        }

        // ========== JWT ==========
        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _config.GetSection("Jwt");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Role, user.Role)
            };

            if (user.CustomerId.HasValue)
            {
                claims.Add(new Claim("customerId", user.CustomerId.Value.ToString()));
            }

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(3),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
