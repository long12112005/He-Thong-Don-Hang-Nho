using System.Collections.Generic;
using System.Linq;
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
    [Authorize(Roles = "Admin")] // Chỉ Admin được thao tác trực tiếp với chi tiết đơn hàng
    public class OrderDetailsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrderDetailsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ================== LẤY TẤT CẢ CHI TIẾT ĐƠN HÀNG ==================
        // GET: api/orderdetails
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderDetailDto>>> GetAll()
        {
            var details = await _context.OrderDetails.ToListAsync();
            var result = details.Select(MapToDto).ToList();
            return Ok(result);
        }

        // ================== LẤY 1 CHI TIẾT ĐƠN HÀNG ==================
        // GET: api/orderdetails/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<OrderDetailDto>> GetById(int id)
        {
            var detail = await _context.OrderDetails.FindAsync(id);
            if (detail == null)
                return NotFound();

            return Ok(MapToDto(detail));
        }

        // ================== LẤY CÁC CHI TIẾT THEO ORDER ID ==================
        // GET: api/orderdetails/order/3
        [HttpGet("order/{orderId:int}")]
        public async Task<ActionResult<IEnumerable<OrderDetailDto>>> GetByOrder(int orderId)
        {
            var details = await _context.OrderDetails
                .Where(d => d.OrderId == orderId)
                .ToListAsync();

            var result = details.Select(MapToDto).ToList();
            return Ok(result);
        }

        // ================== TẠO MỚI CHI TIẾT ĐƠN HÀNG ==================
        // POST: api/orderdetails
        [HttpPost]
        public async Task<ActionResult<OrderDetailDto>> Create([FromBody] CreateOrderDetailDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.OrderId == null || dto.OrderId <= 0)
                return BadRequest(new { message = "OrderId phải > 0." });

            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.Id == dto.OrderId.Value);

            if (order == null)
                return BadRequest(new { message = "Đơn hàng không tồn tại." });

            if (dto.Quantity <= 0)
                return BadRequest(new { message = "Số lượng phải > 0." });

            var product = await _context.Products.FindAsync(dto.ProductId);
            if (product == null)
                return BadRequest(new { message = $"Sản phẩm {dto.ProductId} không tồn tại." });

            if (product.Price < 0)
                return BadRequest(new { message = "Giá sản phẩm phải >= 0." });

            var detail = new OrderDetail
            {
                OrderId = dto.OrderId.Value,
                ProductId = dto.ProductId,
                Quantity = dto.Quantity,
                UnitPrice = product.Price
            };

            _context.OrderDetails.Add(detail);
            await _context.SaveChangesAsync();

            await UpdateOrderTotal(order.Id);

            var result = MapToDto(detail);
            return CreatedAtAction(nameof(GetById), new { id = detail.Id }, result);
        }

        // ================== CẬP NHẬT CHI TIẾT ĐƠN HÀNG ==================
        // PUT: api/orderdetails/5
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] OrderDetailUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (id != dto.Id)
                return BadRequest(new { message = "Id không khớp." });

            var detail = await _context.OrderDetails.FindAsync(id);
            if (detail == null)
                return NotFound();

            if (dto.Quantity <= 0)
                return BadRequest(new { message = "Số lượng phải > 0." });

            var product = await _context.Products.FindAsync(dto.ProductId);
            if (product == null)
                return BadRequest(new { message = $"Sản phẩm {dto.ProductId} không tồn tại." });

            if (product.Price < 0)
                return BadRequest(new { message = "Giá sản phẩm phải >= 0." });

            detail.ProductId = dto.ProductId;
            detail.Quantity = dto.Quantity;
            detail.UnitPrice = product.Price;

            await _context.SaveChangesAsync();

            await UpdateOrderTotal(detail.OrderId);

            return NoContent();
        }

        // ================== XÓA CHI TIẾT ĐƠN HÀNG ==================
        // DELETE: api/orderdetails/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var detail = await _context.OrderDetails.FindAsync(id);
            if (detail == null)
                return NotFound();

            int orderId = detail.OrderId;

            _context.OrderDetails.Remove(detail);
            await _context.SaveChangesAsync();

            await UpdateOrderTotal(orderId);

            return NoContent();
        }

        // ================== HỖ TRỢ: TÍNH LẠI TỔNG TIỀN CHO ĐƠN HÀNG ==================
        private async Task UpdateOrderTotal(int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
                return;

            order.TotalAmount = order.OrderDetails.Sum(d => d.Quantity * d.UnitPrice);
            await _context.SaveChangesAsync();
        }

        private static OrderDetailDto MapToDto(OrderDetail d)
        {
            return new OrderDetailDto
            {
                Id = d.Id,
                OrderId = d.OrderId,
                ProductId = d.ProductId,
                Quantity = d.Quantity,
                UnitPrice = d.UnitPrice
            };
        }
    }
}
