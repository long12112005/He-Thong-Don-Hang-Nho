namespace HeThongDonHangNho.Api.Repositories {
    public interface IProductRepository {
        Task<List<Product>> GetByIdsAsync(IEnumerable<int> ids);
        Task<Product> GetByIdAsync(int id);
        Task UpdateAsync(Product product);
    }
}