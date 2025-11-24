using HeThongDonHangNho.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HeThongDonHangNho.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }


        // Existing sets (Products, Customers, Users...)
        public DbSet<Product> Products { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }


        // New sets
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }


        protected override void OnModelCreating(ModelBuilder builder) {
        base.OnModelCreating(builder);


        builder.Entity<OrderDetail>()
        .HasOne(d => d.Order)
        .WithMany(o => o.OrderDetails)
        .HasForeignKey(d => d.OrderId)
        .OnDelete(DeleteBehavior.Cascade);


        builder.Entity<Order>()
        .Property(o => o.TotalAmount)
        .HasColumnType("decimal(18,2)");


        builder.Entity<OrderDetail>()
        .Property(od => od.UnitPrice)
        .HasColumnType("decimal(18,2)");


        // If Product.Price exists, ensure type
        builder.Entity<Product>()
        .Property(p => p.Price)
        .HasColumnType("decimal(18,2)");
    }
}
