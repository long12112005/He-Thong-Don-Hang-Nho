using HeThongDonHangNho.Api.DTOs.Orders;

namespace HeThongDonHangNho.Api.Services {
    public interface IOrderService {
        Task<OrderDto> CreateOrderAsync(CreateOrderDto dto, int? userId);
        Task<OrderDto> GetByIdWithDetailsAsync(int id);
        Task<List<OrderDto>> GetAllAsync(int page, int pageSize);
        Task<List<OrderDto>> GetByUserAsync(int userId, int page, int pageSize);
    }
}