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
    [Authorize(Roles = "Admin")] // Chỉ Admin được thao tác trực tiếp OrderDetail
    public class OrderDetailsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrderDetailsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ================== LẤY TOÀN BỘ CHI TIẾT ==================
        // GET: api/orderdetails
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderDetailDto>>> GetAll()
        {
            var details = await _context.OrderDetails.ToListAsync();
            var result = details.Select(ToOrderDetailDto).ToList();
            return Ok(result);
        }

        // ================== LẤY CHI TIẾT THEO ID ==================
        // GET: api/orderdetails/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<OrderDetailDto>> GetById(int id)
        {
            var detail = await _context.OrderDetails.FindAsync(id);

            if (detail == null)
                return NotFound();

            return Ok(ToOrderDetailDto(detail));
        }

        // ================== LẤY LIST CHI TIẾT THEO ORDER ID ==================
        // GET: api/orderdetails/order/3
        [HttpGet("order/{orderId:int}")]
        public async Task<ActionResult<IEnumerable<OrderDetailDto>>> GetByOrder(int orderId)
        {
            var details = await _context.OrderDetails
                .Where(od => od.OrderId == orderId)
                .ToListAsync();

            var result = details.Select(ToOrderDetailDto).ToList();
            return Ok(result);
        }

        // ================== TẠO MỚI CHI TIẾT ĐƠN HÀNG ==================
        // POST: api/orderdetails
        [HttpPost]
        public async Task<ActionResult<OrderDetailDto>> Create([FromBody] OrderDetailCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Kiểm tra Order có tồn tại không
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.Id == dto.OrderId);

            if (order == null)
                return BadRequest(new { message = "Order không tồn tại!" });

            // Kiểm tra Product
            var product = await _context.Products.FindAsync(dto.ProductId);
            if (product == null)
                return BadRequest(new { message = $"Sản phẩm {dto.ProductId} không tồn tại!" });

            if (dto.Quantity <= 0)
                return BadRequest(new { message = "Số lượng phải > 0." });

            var detail = new OrderDetail
            {
                OrderId = dto.OrderId,
                ProductId = dto.ProductId,
                Quantity = dto.Quantity,
                UnitPrice = product.Price
            };

            _context.OrderDetails.Add(detail);
            await _context.SaveChangesAsync();

            // Cập nhật tổng tiền Order
            await UpdateOrderTotal(dto.OrderId);

            var result = ToOrderDetailDto(detail);
            return CreatedAtAction(nameof(GetById), new { id = detail.Id }, result);
        }

        // ================== UPDATE CHI TIẾT ==================
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

            // Check product mới
            var product = await _context.Products.FindAsync(dto.ProductId);
            if (product == null)
                return BadRequest(new { message = $"Sản phẩm {dto.ProductId} không tồn tại!" });

            if (dto.Quantity <= 0)
                return BadRequest(new { message = "Số lượng phải > 0." });

            // Update
            detail.ProductId = dto.ProductId;
            detail.Quantity = dto.Quantity;
            detail.UnitPrice = product.Price;

            await _context.SaveChangesAsync();

            // Cập nhật tổng tiền order
            await UpdateOrderTotal(detail.OrderId);

            return NoContent();
        }

        // ================== DELETE CHI TIẾT ==================
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

            // Cập nhật tổng tiền Order
            await UpdateOrderTotal(orderId);

            return NoContent();
        }

        // ================== HÀM TÍNH LẠI TỔNG TIỀN ORDER ==================
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

        private static OrderDetailDto ToOrderDetailDto(OrderDetail d)
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
