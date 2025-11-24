namespace HeThongDonHangNho.Api.Repositories {
    public class ProductRepository : IProductRepository {
        private readonly ApplicationDbContext _db;
        public ProductRepository(ApplicationDbContext db) { _db = db; }
        public async Task<List<Product>> GetByIdsAsync(IEnumerable<int> ids) {
            return await _db.Products.Where(p => ids.Contains(p.Id)).ToListAsync();
        }
        public async Task<Product> GetByIdAsync(int id) {
            return await _db.Products.FirstOrDefaultAsync(p => p.Id == id);
        }
        public async Task UpdateAsync(Product product) {
            _db.Products.Update(product);
            await _db.SaveChangesAsync();
        }
    }
}