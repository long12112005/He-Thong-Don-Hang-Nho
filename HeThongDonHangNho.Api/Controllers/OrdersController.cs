using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using HeThongDonHangNho.Api.Data;
using HeThongDonHangNho.Api.DTOs;
using HeThongDonHangNho.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HeThongDonHangNho.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Yêu cầu phải đăng nhập cho toàn bộ Order API
    public class OrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrdersController(ApplicationDbContext context)
        {
            _context = context;
        }

        private string? GetCurrentRole()
        {
            return User.FindFirstValue(ClaimTypes.Role);
        }

        private int? GetCurrentCustomerId()
        {
            var claim = User.FindFirst("CustomerId");
            if (claim != null && int.TryParse(claim.Value, out var customerId))
            {
                return customerId;
            }
            return null;
        }

        private bool IsAdmin => string.Equals(GetCurrentRole(), "Admin", StringComparison.OrdinalIgnoreCase);

        // ================== LẤY TẤT CẢ ĐƠN HÀNG (ADMIN) ==================
        // GET: api/orders
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetAll()
        {
            var orders = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                .ToListAsync();

            var result = orders.Select(MapToOrderDto).ToList();
            return Ok(result);
        }

        // ================== LẤY ĐƠN HÀNG CỦA CHÍNH USER ==================
        // GET: api/orders/my
        [HttpGet("my")]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetMyOrders()
        {
            var customerId = GetCurrentCustomerId();
            if (customerId == null)
            {
                return BadRequest(new { message = "Tài khoản hiện tại chưa được gán với khách hàng (CustomerId)." });
            }

            var orders = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                .Where(o => o.CustomerId == customerId.Value)
                .ToListAsync();

            var result = orders.Select(MapToOrderDto).ToList();
            return Ok(result);
        }

        // ================== LẤY 1 ĐƠN HÀNG THEO ID ==================
        // Admin xem được tất cả; User chỉ xem đơn của chính mình
        // GET: api/orders/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<OrderDto>> GetById(int id)
        {
            var order = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
                return NotFound();

            if (!IsAdmin)
            {
                var customerId = GetCurrentCustomerId();
                if (customerId == null || order.CustomerId != customerId.Value)
                    return Forbid();
            }

            var dto = MapToOrderDto(order);
            return Ok(dto);
        }

        // ================== TẠO ĐƠN HÀNG MỚI ==================
        // Admin & User đều có thể tạo:
        // - User: luôn tạo đơn cho chính mình (CustomerId từ claim)
        // - Admin: tạo đơn cho khách bất kỳ (CustomerId từ body)
        // POST: api/orders
        [HttpPost]
        public async Task<ActionResult<OrderDto>> Create([FromBody] CreateOrderDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.OrderDetails == null || !dto.OrderDetails.Any())
                return BadRequest(new { message = "Đơn hàng phải có ít nhất 1 sản phẩm." });

            int customerId;

            if (IsAdmin)
            {
                if (dto.CustomerId <= 0)
                    return BadRequest(new { message = "Admin tạo đơn phải truyền CustomerId hợp lệ." });

                var customer = await _context.Customers.FindAsync(dto.CustomerId);
                if (customer == null)
                    return BadRequest(new { message = "Khách hàng không tồn tại." });

                customerId = dto.CustomerId.Value;
            }
            else
            {
                var currentCustomerId = GetCurrentCustomerId();
                if (currentCustomerId == null)
                    return BadRequest(new { message = "Tài khoản hiện tại chưa được gán với khách hàng (CustomerId)." });

                customerId = currentCustomerId.Value;
            }

            // Chuẩn bị danh sách chi tiết đơn, lấy UnitPrice từ Product.Price
            var orderDetails = new List<OrderDetail>();

            foreach (var item in dto.OrderDetails)
            {
                if (item.Quantity <= 0)
                    return BadRequest(new { message = "Số lượng mỗi sản phẩm phải > 0." });

                var product = await _context.Products.FindAsync(item.ProductId);
                if (product == null)
                    return BadRequest(new { message = $"Sản phẩm {item.ProductId} không tồn tại." });

                if (product.Price < 0)
                    return BadRequest(new { message = $"Giá sản phẩm {product.Name} không hợp lệ." });

                var detail = new OrderDetail
                {
                    ProductId = product.Id,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price
                };

                orderDetails.Add(detail);
            }

            var totalAmount = orderDetails.Sum(d => d.UnitPrice * d.Quantity);

            var order = new Order
            {
                CustomerId = customerId,
                OrderDate = DateTime.UtcNow,
                Status = "Pending",
                TotalAmount = totalAmount,
                OrderDetails = orderDetails
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            var result = MapToOrderDto(order);
            return CreatedAtAction(nameof(GetById), new { id = order.Id }, result);
        }

        // ================== CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG (ADMIN) ==================
        // PUT: api/orders/5/status
        [HttpPut("{id:int}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] OrderUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (id != dto.Id)
                return BadRequest(new { message = "Id không khớp." });

            var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == id);
            if (order == null)
                return NotFound();

            order.Status = dto.Status;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ================== XÓA ĐƠN HÀNG (ADMIN) ==================
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

            _context.OrderDetails.RemoveRange(order.OrderDetails);
            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // ================== HÀM MAP MODEL -> DTO ==================
        private static OrderDto MapToOrderDto(Order o)
        {
            return new OrderDto
            {
                Id = o.Id,
                CustomerId = o.CustomerId,

                // Thông tin khách hàng
                CustomerName = o.Customer?.Name,
                CustomerAddress = o.Customer?.Address,

                OrderDate = o.OrderDate,
                Status = o.Status,
                TotalAmount = o.TotalAmount,
                OrderDetails = o.OrderDetails?
                    .Select(d => new OrderDetailDto
                    {
                        Id = d.Id,
                        OrderId = d.OrderId,
                        ProductId = d.ProductId,
                        ProductName = d.Product?.Name,
                        Quantity = d.Quantity,
                        UnitPrice = d.UnitPrice
                    })
                    .ToList() ?? new List<OrderDetailDto>()
            };
        }
    }
}
