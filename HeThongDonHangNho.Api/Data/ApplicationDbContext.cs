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

        // ============== CÁC BẢNG ==============

        public DbSet<Customer> Customers { get; set; } = null!;
        public DbSet<Product> Products { get; set; } = null!;
        public DbSet<Order> Orders { get; set; } = null!;
        public DbSet<OrderDetail> OrderDetails { get; set; } = null!;

        // ============== CONFIG ==============

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // -------- DECIMAL COLUMN TYPE --------
            modelBuilder.Entity<Product>()
                .Property(p => p.Price)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Order>()
                .Property(o => o.TotalAmount)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<OrderDetail>()
                .Property(od => od.UnitPrice)
                .HasColumnType("decimal(18,2)");

            // -------- QUAN HỆ ORDER - CUSTOMER --------
            // Order có CustomerId, nhưng Customer không có navigation Orders
            modelBuilder.Entity<Order>()
                .HasOne<Customer>()                  // không có property navigation trong Order
                .WithMany()                          // không có ICollection<Order> trong Customer
                .HasForeignKey(o => o.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            // -------- QUAN HỆ ORDERDETAIL - ORDER --------
            modelBuilder.Entity<OrderDetail>()
                .HasOne(od => od.Order)
                .WithMany(o => o.OrderDetails)
                .HasForeignKey(od => od.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // -------- QUAN HỆ ORDERDETAIL - PRODUCT --------
            // Chỉ có ProductId, không có navigation Product trong OrderDetail
            modelBuilder.Entity<OrderDetail>()
                .HasOne<Product>()                   // không có OrderDetail.Product
                .WithMany()                          // không có Product.OrderDetails
                .HasForeignKey(od => od.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            // -------- MỘT SỐ RÀNG BUỘC KHÁC (OPTIONAL) --------
            modelBuilder.Entity<Order>()
                .Property(o => o.Status)
                .HasMaxLength(50);

            modelBuilder.Entity<Customer>()
                .Property(c => c.Name)
                .HasMaxLength(200);

            modelBuilder.Entity<Customer>()
                .Property(c => c.Phone)
                .HasMaxLength(20);
        }
    }
}
