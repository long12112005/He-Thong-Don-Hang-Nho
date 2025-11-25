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
    [Authorize] // tất cả API OrderDetail yêu cầu đăng nhập
    public class OrderDetailsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrderDetailsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =========================================================
        // LẤY TOÀN BỘ CHI TIẾT (CHỈ ADMIN)
        // =========================================================
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<OrderDetail>>> GetAll()
        {
            return await _context.OrderDetails.ToListAsync();
        }

        // =========================================================
        // LẤY CHI TIẾT THEO ID
        // =========================================================
        [HttpGet("{id:int}")]
        public async Task<ActionResult<OrderDetail>> GetById(int id)
        {
            var detail = await _context.OrderDetails.FindAsync(id);

            if (detail == null)
                return NotFound();

            return Ok(detail);
        }

        // =========================================================
        // LẤY LIST CHI TIẾT THEO ORDER ID
        // =========================================================
        [HttpGet("order/{orderId:int}")]
        public async Task<ActionResult<IEnumerable<OrderDetail>>> GetByOrder(int orderId)
        {
            var details = await _context.OrderDetails
                .Where(od => od.OrderId == orderId)
                .ToListAsync();

            return Ok(details);
        }

        // =========================================================
        // TẠO MỚI CHI TIẾT ĐƠN HÀNG
        // =========================================================
        [HttpPost]
        public async Task<ActionResult<OrderDetail>> Create(OrderDetail detail)
        {
            // Kiểm tra Order có tồn tại không
            var order = await _context.Orders.FindAsync(detail.OrderId);
            if (order == null)
                return BadRequest("Order không tồn tại!");

            _context.OrderDetails.Add(detail);

            // Lưu trước để chi tiết được tạo
            await _context.SaveChangesAsync();

            // Cập nhật tổng tiền Order
            await UpdateOrderTotal(detail.OrderId);

            return CreatedAtAction(nameof(GetById), new { id = detail.Id }, detail);
        }

        // =========================================================
        // UPDATE CHI TIẾT
        // =========================================================
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, OrderDetail updated)
        {
            if (id != updated.Id)
                return BadRequest();

            var detail = await _context.OrderDetails.FindAsync(id);
            if (detail == null)
                return NotFound();

            // Cho update các trường
            detail.ProductId = updated.ProductId;
            detail.Quantity = updated.Quantity;
            detail.UnitPrice = updated.UnitPrice;

            await _context.SaveChangesAsync();

            // Cập nhật tổng tiền order
            await UpdateOrderTotal(detail.OrderId);

            return NoContent();
        }

        // =========================================================
        // DELETE CHI TIẾT
        // =========================================================
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var detail = await _context.OrderDetails.FindAsync(id);
            if (detail == null)
                return NotFound();

            int orderId = detail.OrderId;

            _context.OrderDetails.Remove(detail);
            await _context.SaveChangesAsync();

            // Cập nhật tổng tiền Order
            await UpdateOrderTotal(orderId);

            return NoContent();
        }

        // =========================================================
        // HÀM TÍNH LẠI TỔNG TIỀN ORDER
        // =========================================================
        private async Task UpdateOrderTotal(int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null) return;

            order.TotalAmount = order.OrderDetails.Sum(od => od.Quantity * od.UnitPrice);
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }
    }
}

