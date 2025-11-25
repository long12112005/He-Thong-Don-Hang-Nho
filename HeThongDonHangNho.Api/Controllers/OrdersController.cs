using System.Security.Claims;
using HeThongDonHangNho.Api.Data;
using HeThongDonHangNho.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HeThongDonHangNho.Api.DTOs;

namespace HeThongDonHangNho.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // tất cả API order yêu cầu đăng nhập
    public class OrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrdersController(ApplicationDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId()
        {
            var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.Parse(id);
        }

        private bool IsAdmin => User.IsInRole("Admin");

        // ================== LẤY DANH SÁCH ORDER (ADMIN) ==================
        // GET: api/orders
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetAll()
        {
            var orders = await _context.Orders
                .Include(o => o.OrderDetails)
                .ToListAsync();

            var result = orders.Select(ToOrderDto).ToList();
            return Ok(result);
        }

        // ================== LẤY ĐƠN CỦA CHÍNH USER ==================
        // GET: api/orders/my
        [HttpGet("my")]
        [Authorize(Roles = "User")]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetMyOrders()
        {
            var currentUserId = GetCurrentUserId();

            var orders = await _context.Orders
                .Include(o => o.OrderDetails)
                .Where(o => o.UserId == currentUserId)
                .ToListAsync();

            var result = orders.Select(ToOrderDto).ToList();
            return Ok(result);
        }

        // ================== LẤY CHI TIẾT MỘT ORDER ==================
        // GET: api/orders/5
        // Admin xem được tất cả, User chỉ xem được đơn của mình
        [HttpGet("{id:int}")]
        public async Task<ActionResult<OrderDto>> GetById(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
                return NotFound();

            if (!IsAdmin)
            {
                var currentUserId = GetCurrentUserId();

                if (order.UserId != currentUserId)
                    return Forbid(); // User cố xem đơn của người khác
            }

            var dto = ToOrderDto(order);
            return Ok(dto);
        }

        // ================== TẠO ĐƠN HÀNG MỚI ==================
        // POST: api/orders
        // Admin & User đều tạo đơn được, nhưng User chỉ tạo cho chính mình
        [HttpPost]
        public async Task<ActionResult<OrderDto>> Create([FromBody] OrderCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.OrderDetails == null || !dto.OrderDetails.Any())
                return BadRequest(new { message = "Đơn hàng phải có ít nhất 1 sản phẩm." });

            var currentUserId = GetCurrentUserId();
            var role = User.FindFirstValue(ClaimTypes.Role);

            int? userIdForOrder = role == "User" ? currentUserId : null;

            // Nếu m có link User -> Customer, chỗ này có thể check CustomerId có thuộc User hay không
            if (role == "User")
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == currentUserId);
                if (user == null || user.CustomerId == null || user.CustomerId != dto.CustomerId)
                {
                    return Forbid();
                }
            }

            // Chuẩn bị OrderDetails: lấy giá từ Product trong DB
            var orderDetails = new List<OrderDetail>();

            foreach (var item in dto.OrderDetails)
            {
                if (item.Quantity <= 0)
                    return BadRequest(new { message = "Số lượng phải > 0." });

                var product = await _context.Products.FindAsync(item.ProductId);
                if (product == null)
                    return BadRequest(new { message = $"Sản phẩm {item.ProductId} không tồn tại." });

                var detail = new OrderDetail
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price
                };

                orderDetails.Add(detail);
            }

            var order = new Order
            {
                CustomerId = dto.CustomerId,
                ShippingAddress = dto.ShippingAddress ?? string.Empty,
                Status = "Pending",
                OrderDate = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = null,
                UserId = userIdForOrder,
                OrderDetails = orderDetails
            };

            order.TotalAmount = order.OrderDetails.Sum(od => od.Quantity * od.UnitPrice);

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            var result = ToOrderDto(order);

            return CreatedAtAction(nameof(GetById), new { id = order.Id }, result);
        }

        // ================== CẬP NHẬT ĐƠN HÀNG ==================
        // Chỉ Admin được update (ví dụ đổi trạng thái, địa chỉ...)
        // PUT: api/orders/5
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] OrderUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (id != dto.Id)
                return BadRequest(new { message = "Id không khớp." });

            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
                return NotFound();

            order.Status = dto.Status;
            order.ShippingAddress = dto.ShippingAddress ?? order.ShippingAddress;
            order.UpdatedAt = DateTime.UtcNow;

            // Tính lại tổng tiền từ chi tiết (an toàn hơn là tin client)
            order.TotalAmount = order.OrderDetails.Sum(od => od.Quantity * od.UnitPrice);

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // ================== XÓA ĐƠN HÀNG ==================
        // Chỉ Admin được xóa
        // DELETE: api/orders/5
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
                return NotFound();

            // Xóa chi tiết trước cho chắc (nếu không dùng cascade)
            _context.OrderDetails.RemoveRange(order.OrderDetails);
            _context.Orders.Remove(order);

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // ================== MAPPING HELPER ==================

        private static OrderDto ToOrderDto(Order o)
        {
            return new OrderDto
            {
                Id = o.Id,
                CustomerId = o.CustomerId,
                Status = o.Status,
                ShippingAddress = o.ShippingAddress,
                TotalAmount = o.TotalAmount,
                CreatedAt = o.CreatedAt,
                UpdatedAt = o.UpdatedAt,
                OrderDetails = o.OrderDetails?
                    .Select(d => new OrderDetailDto
                    {
                        Id = d.Id,
                        OrderId = d.OrderId,
                        ProductId = d.ProductId,
                        Quantity = d.Quantity,
                        UnitPrice = d.UnitPrice
                    })
                    .ToList() ?? new List<OrderDetailDto>()
            };
        }
    }
}
