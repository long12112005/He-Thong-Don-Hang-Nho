using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HeThongDonHangNho.Api.Data;
using HeThongDonHangNho.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

        // ================== LẤY DANH SÁCH ORDER ==================
        // Chỉ Admin mới được xem tất cả đơn
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<Order>>> GetAll()
        {
            var orders = await _context.Orders
                .Include(o => o.OrderDetails)
                .ToListAsync();

            return Ok(orders);
        }

        // ================== LẤY CHI TIẾT MỘT ORDER ==================
        // GET: api/orders/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<Order>> GetById(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
                return NotFound();

            return Ok(order);
        }

        // ================== TẠO ĐƠN HÀNG MỚI ==================
        // POST: api/orders
        [HttpPost]
        public async Task<ActionResult<Order>> Create(Order order)
        {
            // Tính TotalAmount nếu có OrderDetails gửi lên
            if (order.OrderDetails != null && order.OrderDetails.Count > 0)
            {
                order.TotalAmount = order.OrderDetails.Sum(od => od.Quantity * od.UnitPrice);
            }

            order.CreatedAt = DateTime.UtcNow;
            order.UpdatedAt = null;

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
        }

        // ================== CẬP NHẬT ĐƠN HÀNG ==================
        // Chỉ Admin được update (ví dụ đổi trạng thái, địa chỉ...)
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, Order updated)
        {
            if (id != updated.Id)
                return BadRequest();

            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
                return NotFound();

            // Update các field cho phép
            order.Status = updated.Status;
            order.ShippingAddress = updated.ShippingAddress;
            order.TotalAmount = updated.TotalAmount;
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // ================== XÓA ĐƠN HÀNG ==================
        // Chỉ Admin được xóa
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
                return NotFound();

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
