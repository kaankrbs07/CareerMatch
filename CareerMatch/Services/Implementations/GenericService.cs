// Services/Implementations/GenericService.cs

using CareerMatch.Data;
using CareerMatch.Services.Interfaces;
using CareerMatch.Models.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CareerMatch.Services.Implementations
{
    public class GenericService<T> : IGenericService<T> where T : class
    {
        protected readonly AppDbContext _context;
        protected readonly DbSet<T> _dbSet;
        protected readonly ILogger<GenericService<T>> _logger;

        public GenericService(AppDbContext context, ILogger<GenericService<T>> logger)
        {
            _context = context;
            _dbSet = _context.Set<T>(); // 'T' hangi modelse (örn: Occupations) o tabloyu temsil eder
            _logger = logger;
        }

        public virtual async Task<T?> GetByIdAsync(int id)
        {
            return await _dbSet.FindAsync(id);
        }

        public virtual async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _dbSet.ToListAsync();
        }

        public virtual async Task AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
        }

        public virtual void Update(T entity)
        {
            // Entity'nin zaten takip edildiðini varsayýyoruz (GetById ile çekildiyse)
            // Eðer takip edilmiyorsa (DTO'dan geliyorsa) 'Attach' ve 'Modified' gerekir.
            _dbSet.Attach(entity);
            _context.Entry(entity).State = EntityState.Modified;
        }

        public virtual void Delete(T entity)
        {
            if (entity is IActiveEntity activeEntity)
            {
                activeEntity.IsActive = false;
                Update(entity);
            }
            else
            {
                _dbSet.Remove(entity);
            }
        }

        public async Task<int> SaveChangesAsync()
        {
            // Bu, Update ve Delete'in veritabanýna yansýmasýný saðlar
            return await _context.SaveChangesAsync();
        }
    }
}
