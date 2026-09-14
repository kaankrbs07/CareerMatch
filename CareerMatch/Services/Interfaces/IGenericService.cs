// Services/Interfaces/IGenericService.cs

namespace CareerMatch.Services.Interfaces
{
    // 'T' bir class (entity/model) olmalýdýr (where T : class)
    public interface IGenericService<T> where T : class
    { 
        
        // ID'ye göre bir varlýðý getirir.
        Task<T?> GetByIdAsync(int id);
         
        
        // Tüm varlýklarý getirir.
        Task<IEnumerable<T>> GetAllAsync();
        

        // Yeni bir varlýk ekler.
        Task AddAsync(T entity);

  
        // Bir varlýðý günceller.
        void Update(T entity); // Güncelleme genellikle senkrondur, SaveChangesAsync'e kadar
        
        /// Bir varlýðý siler.
        void Delete(T entity);

        // Not: Genellikle 'Update' ve 'Delete' iþlemleri
        // 'Unit of Work' deseniyle birlikte kullanýlýr ve 
        // SaveChangesAsync'i çaðýran ayrý bir metot olur.
        // Þimdilik basit tutalým ve controller'da SaveChangesAsync çaðýrabiliriz
        // VEYA daha iyisi, bunu GenericService'e ekleyelim:
        
        Task<int> SaveChangesAsync();
    }
}
