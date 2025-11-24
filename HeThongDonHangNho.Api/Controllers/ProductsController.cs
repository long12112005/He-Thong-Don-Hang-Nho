using HeThongDonHangNho.Api.Data;
using HeThongDonHangNho.Api.Models;
using HeThongDonHangNho.Api.Dtos.Products;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;   

namespace HeThongDonHangNho.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] 
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ================== GET: api/products ==================
        // Cho phép ai cũng xem danh sách sản phẩm
        [HttpGet]
        [AllowAnonymous] // 👈 bỏ qua [Authorize] ở trên, không cần token
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetAll()
        {
            var products = await _context.Products
                .Where(p => p.IsActive)
                .ToListAsync();

            var result = products.Select(ToProductDto).ToList();

            return Ok(result);
        }

        // ================== GET: api/products/5 ==================
        // Cho phép ai cũng xem chi tiết 1 sản phẩm
        [HttpGet("{id:int}")]
        [AllowAnonymous]
        public async Task<ActionResult<ProductDto>> GetById(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null || !product.IsActive)
                return NotFound();

            var dto = ToProductDto(product);
            return Ok(dto);
        }

        // ================== POST: api/products ==================
        // 👇 Chỉ ADMIN mới được thêm sản phẩm
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ProductDto>> Create(CreateProductDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var product = ToProductEntity(dto);

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            var result = ToProductDto(product);

            return CreatedAtAction(nameof(GetById), new { id = product.Id }, result);
        }

        // ================== PUT: api/products/5 ==================
        // 👇 Chỉ ADMIN mới được sửa sản phẩm
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, UpdateProductDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound();

            UpdateProductEntity(product, dto);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                var exists = await _context.Products.AnyAsync(p => p.Id == id);
                if (!exists)
                    return NotFound();

                throw;
            }

            return NoContent();
        }

        // ================== DELETE: api/products/5 ==================
        // 👇 Chỉ ADMIN mới được “xóa mềm” sản phẩm
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound();

            product.IsActive = false;   // xóa mềm
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // ================== MAPPING ==================

        private static ProductDto ToProductDto(Product p)
        {
            return new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                Stock = p.Stock,
                IsActive = p.IsActive
            };
        }

        private static Product ToProductEntity(CreateProductDto dto)
        {
            return new Product
            {
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                Stock = dto.Stock,
                IsActive = true
            };
        }

        private static void UpdateProductEntity(Product entity, UpdateProductDto dto)
        {
            entity.Name = dto.Name;
            entity.Description = dto.Description;
            entity.Price = dto.Price;
            entity.Stock = dto.Stock;
            entity.IsActive = dto.IsActive;
        }
    }
}
