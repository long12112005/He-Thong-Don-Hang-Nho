using HeThongDonHangNho.Api.Data;
using HeThongDonHangNho.Api.Models;
using HeThongDonHangNho.Api.Dtos.Customers;   
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace HeThongDonHangNho.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")] // Chỉ Admin mới được quản lý khách hàng
    public class CustomersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CustomersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/customers
        [HttpGet]
        [Authorize(Roles = "Admin")] // Admin được xem danh sách khách hàng
        public async Task<ActionResult<IEnumerable<CustomerDto>>> GetCustomers()
        {
            var customers = await _context.Customers.ToListAsync();

            // Entity -> DTO
            var result = customers.Select(ToCustomerDto).ToList();

            return Ok(result);
        }

        // GET: api/customers/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<CustomerDto>> GetCustomer(int id)
        {
            var customer = await _context.Customers.FindAsync(id);

            if (customer == null)
                return NotFound();

            var dto = ToCustomerDto(customer);

            return Ok(dto);
        }

        // POST: api/customers
        [HttpPost]
        [Authorize(Roles = "Admin")] // Chỉ Admin mới được tạo khách hàng
        public async Task<ActionResult<CustomerDto>> CreateCustomer(CreateCustomerDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // DTO -> Entity
            var customer = ToCustomerEntity(dto);

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            var result = ToCustomerDto(customer);

            return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, result);
        }

        // PUT: api/customers/5
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")] // Chỉ Admin mới được cập nhật khách hàng
        public async Task<IActionResult> UpdateCustomer(int id, UpdateCustomerDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
                return NotFound();

            // DTO -> Entity (update)
            UpdateCustomerEntity(customer, dto);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CustomerExists(id))
                    return NotFound();

                throw;
            }

            return NoContent();
        }

        // DELETE: api/customers/5
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")] // Chỉ Admin mới được xóa khách hàng
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
                return NotFound();

            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CustomerExists(int id)
        {
            return _context.Customers.Any(e => e.Id == id);
        }

        // ================== MAPPING HELPER ==================

        private static CustomerDto ToCustomerDto(Customer c)
        {
            return new CustomerDto
            {
                Id = c.Id,
                Name = c.Name,
                Phone = c.Phone,
                Email = c.Email,      // ✅ TRẢ EMAIL RA CHO CLIENT
                Address = c.Address
            };
        }

        private static Customer ToCustomerEntity(CreateCustomerDto dto)
        {
            return new Customer
            {
                Name = dto.Name,
                Phone = dto.Phone,
                Email = dto.Email,    // ✅ NHẬN EMAIL TỪ DTO
                Address = dto.Address
            };
        }

        private static void UpdateCustomerEntity(Customer entity, UpdateCustomerDto dto)
        {
            entity.Name = dto.Name;
            entity.Phone = dto.Phone;
            entity.Email = dto.Email;    // ✅ CẬP NHẬT EMAIL
            entity.Address = dto.Address;
        }
    }
}
