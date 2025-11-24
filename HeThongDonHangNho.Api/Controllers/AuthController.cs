using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HeThongDonHangNho.Api.Data;


namespace HeThongDonHangNho.Api.Controllers {
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase {
        private readonly ApplicationDbContext _db;
        private readonly IConfiguration _config;


        public AuthController(ApplicationDbContext db, IConfiguration config) {
        _db = db;
        _config = config;
        }


        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest req) {
            var user = _db.User.FirstOrDefault(u => u.Username == req.Username || u.Email == req.Username);
            if (user == null) return Unauthorized(new { success = false, message = "Invalid credentials" });
            if (!BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
                return Unauthorized(new { success = false, message = "Invalid credentials" });


            var claims = new List<Claim> {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Role, user.Role ?? "User")
            };


            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.UtcNow.AddMinutes(int.Parse(_config["Jwt:ExpireMinutes"] ?? "60"));


            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: expires,
                signingCredentials: creds
            );


            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
            return Ok(new { success = true, token = tokenString, expires = expires });
        }


        public class LoginRequest {
            public string Username { get; set; }
            public string Password { get; set; }
        }
    }
}