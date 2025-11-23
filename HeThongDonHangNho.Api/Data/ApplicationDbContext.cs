using HeThongDonHangNho.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HeThongDonHangNho.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
            
        }

        public DbSet<Product> Products { get; set; } = null!;
        public DbSet<Customer> Customers { get; set; }= null!;
    }
}
