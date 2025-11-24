using Microsoft.EntityFrameworkCore;
using HeThongDonHangNho.Api.Data;
using HeThongDonHangNho.Api.DTOs.Orders;
using HeThongDonHangNho.Api.Models;

namespace HeThongDonHangNho.Api.Services {
    public class OrderService : IOrderService {
        private readonly ApplicationDbContext _db;
        private readonly IProductRepository _productRepo;


        public OrderService(ApplicationDbContext db, IProductRepository productRepo) {
            _db = db;
            _productRepo = productRepo;
        }


        public async Task<OrderDto> CreateOrderAsync(CreateOrderDto dto, int? userId) {
            if (dto == null) throw new ArgumentNullException(nameof(dto));
            if (dto.Items == null || !dto.Items.Any()) throw new BadHttpRequestException("Order must have items.");


            var productIds = dto.Items.Select(i => i.ProductId).Distinct().ToList();
            var products = await _productRepo.GetByIdsAsync(productIds);


            if (products.Count != productIds.Count) {
                var foundIds = products.Select(p => p.Id);
                var missing = productIds.Except(foundIds);
                throw new BadHttpRequestException($"Products not found: {string.Join(',', missing)}");
            }


            foreach (var item in dto.Items) {
                if (item.Quantity <= 0) throw new BadHttpRequestException($"Quantity for product {item.ProductId} must be > 0.");
                var prod = products.Single(p => p.Id == item.ProductId);
                if (prod.Stock < item.Quantity) throw new BadHttpRequestException($"Product {prod.Name} (id={prod.Id}) only has {prod.Stock} in stock.");
            }
            using var tx = await _db.Database.BeginTransactionAsync();
            try {
                var order = new Order {
                    CustomerId = dto.CustomerId,
                    UserId = userId,
                    OrderDate = DateTime.UtcNow,
                    ShippingAddress = dto.ShippingAddress
                };


                _db.Orders.Add(order);
                await _db.SaveChangesAsync(); // ensure Id


                decimal total = 0M;
                    foreach (var item in dto.Items) {
                    var prod = products.Single(p => p.Id == item.ProductId);
                    var detail = new OrderDetail {
                        OrderId = order.Id,
                        ProductId = prod.Id,
                        Quantity = item.Quantity,
                        UnitPrice = prod.Price
                    };
                    _db.OrderDetails.Add(detail);
                    prod.Stock -= item.Quantity;
                    _db.Products.Update(prod);
                    total += detail.Quantity * detail.UnitPrice;
                }


                order.TotalAmount = total;
                _db.Orders.Update(order);
                await _db.SaveChangesAsync();
                await tx.CommitAsync();


                // Map to DTO (simple mapping)
                return await GetByIdWithDetailsAsync(order.Id);
            }
            catch {
                await tx.RollbackAsync();
                throw; // bubble up as 500
        }
    }
    public async Task<OrderDto> GetByIdWithDetailsAsync(int id) {
        var order = await _db.Orders
                             .Include(o => o.OrderDetails)
                             .ThenInclude(od => od.Order)
                             .FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return null;


        var dto = new OrderDto {
            Id = order.Id,
            CustomerId = order.CustomerId,
            OrderDate = order.OrderDate,
            TotalAmount = order.TotalAmount,
            Items = order.OrderDetails.Select(od => new OrderDetailDto {
                ProductId = od.ProductId,
                ProductName = _db.Products.FirstOrDefault(p => p.Id == od.ProductId)?.Name,
                Quantity = od.Quantity,
                UnitPrice = od.UnitPrice,
                LineTotal = od.Quantity * od.UnitPrice
            }).ToList()
        };
        return dto;
    }
    public async Task<List<OrderDto>> GetAllAsync(int page, int pageSize) {
        var orders = await _db.Orders
                              .Include(o => o.OrderDetails)
                              .OrderByDescending(o => o.OrderDate)
                              .Skip((page - 1) * pageSize)
                              .Take(pageSize)
                              .ToListAsync();
        return orders.Select(o => new OrderDto {
            Id = o.Id,
            CustomerId = o.CustomerId,
            OrderDate = o.OrderDate,
            TotalAmount = o.TotalAmount,
            Items = o.OrderDetails.Select(od => new OrderDetailDto {
                ProductId = od.ProductId,
                ProductName = _db.Products.FirstOrDefault(p => p.Id == od.ProductId)?.Name,
                Quantity = od.Quantity,
                UnitPrice = od.UnitPrice,
                LineTotal = od.Quantity * od.UnitPrice
            }).ToList()
        }).ToList();
    }
    public async Task<List<OrderDto>> GetByUserAsync(int userId, int page, int pageSize) {
        var orders = await _db.Orders
                              .Where(o => o.UserId == userId)
                              .Include(o => o.OrderDetails)
                              .OrderByDescending(o => o.OrderDate)
                              .Skip((page - 1) * pageSize)
                              .Take(pageSize)
                              .ToListAsync();
        return orders.Select(o => new OrderDto {
            Id = o.Id,
            CustomerId = o.CustomerId,
            OrderDate = o.OrderDate,
            TotalAmount = o.TotalAmount,
            Items = o.OrderDetails.Select(od => new OrderDetailDto {
                ProductId = od.ProductId,
                ProductName = _db.Products.FirstOrDefault(p => p.Id == od.ProductId)?.Name,
                Quantity = od.Quantity,
                UnitPrice = od.UnitPrice,
                LineTotal = od.Quantity * od.UnitPrice
            }).ToList()
            }).ToList();
        }
    }
}