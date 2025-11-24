namespace HeThongDonHangNho.Api.Repositories {
    public interface IOrderRepository {
        Task AddAsync(Order order);
        Task<Order> GetByIdWithDetailsAsync(int id);
        Task<List<Order>> GetAllAsync(int page, int pageSize);
        Task<List<Order>> GetByUserAsync(int userId, int page, int pageSize);
    }
}