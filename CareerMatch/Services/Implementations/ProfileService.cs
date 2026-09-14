// Services/Implementations/ProfileService.cs 

using AutoMapper;
using CareerMatch.Data;
using CareerMatch.Dtos;
using CareerMatch.Middlewares; // AppException ve AppErrors için
using CareerMatch.Models;
using CareerMatch.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CareerMatch.Services.Implementations
{
    public class ProfileService : IProfileService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<ProfileService> _logger;

        public ProfileService(AppDbContext context, IMapper mapper, ILogger<ProfileService> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        // ----- JobSeeker (Ýþ Arayan) -----

        public async Task<JobSeekerProfileUpdateDto> GetJobSeekerProfileAsync(int userId)
        {
            // 1. Kullanýcýyý getir ve doðrula (Aktif mi? Doðru rolde mi?)
            // RoleId 3 = JobSeeker
            var user = await GetUserEntityAndVerifyRoleAsync(userId, 3); 
            
            // 2. Ýliþkili JobSeeker profilini getir
            // (Register sýrasýnda oluþturulduðu için FirstAsync kullanmak güvenlidir)
            var jobSeeker = await _context.JobSeekers
                .FirstAsync(js => js.UserId == userId);

            // 3. Ýki modeli tek bir DTO'da birleþtir
            // Önce User'dan (Ad, Soyad) maplenir
            var profileDto = _mapper.Map<JobSeekerProfileUpdateDto>(user);
            
            // Sonra JobSeeker'dan (Ülke, Þehir vb.) maplenir (mevcut DTO üzerine)
            _mapper.Map(jobSeeker, profileDto);

            return profileDto;
        }

        public async Task UpdateJobSeekerProfileAsync(int userId, JobSeekerProfileUpdateDto dto)
        {
            // 1. Güncellenecek varlýklarý getir ve doðrula
            var user = await GetUserEntityAndVerifyRoleAsync(userId, 3); // 3 = JobSeeker
            var jobSeeker = await _context.JobSeekers
                .FirstAsync(js => js.UserId == userId); 

            // 2. DTO -> Modelleri güncelle (AutoMapper'ýn ReverseMap özelliði)
            
            // AutoMapper DTO'daki 'FirstName' ve 'LastName'i 'user' nesnesine günceller
            _mapper.Map(dto, user);
            user.UpdatedAt = DateTime.UtcNow; // Güncelleme tarihini ayarla

            // AutoMapper DTO'daki 'Country', 'City', 'OccupationId' vb.
            // alanlarý 'jobSeeker' nesnesine günceller
            _mapper.Map(dto, jobSeeker);
            // jobSeeker.UpdatedAt = DateTime.UtcNow; // (Eðer JobSeeker modelinde bu alan varsa)

            // 3. Deðiþiklikleri tek bir iþlemde kaydet
            await _context.SaveChangesAsync();
            _logger.LogInformation("JobSeeker profili güncellendi (UserId: {UserId})", userId);
        }

        
        // ----- Employer (Ýþ Veren) -----

        public async Task<EmployerProfileUpdateDto> GetEmployerProfileAsync(int userId)
        {
            // 1. Kullanýcýyý getir ve doðrula
            // RoleId 2 = Employer
            var user = await GetUserEntityAndVerifyRoleAsync(userId, 2); 
            var employer = await _context.Employers
                .FirstAsync(e => e.UserId == userId);

            // 2. Modelleri -> DTO'da birleþtir
            var profileDto = _mapper.Map<EmployerProfileUpdateDto>(user); // Temsilci Adý/Soyadý
            _mapper.Map(employer, profileDto); // Þirket bilgileri

            return profileDto;
        }

        public async Task UpdateEmployerProfileAsync(int userId, EmployerProfileUpdateDto dto)
        {
            // 1. Varlýklarý getir ve doðrula
            var user = await GetUserEntityAndVerifyRoleAsync(userId, 2); // 2 = Employer
            var employer = await _context.Employers
                .FirstAsync(e => e.UserId == userId);

            // 2. DTO -> Modelleri güncelle (ReverseMap)
            _mapper.Map(dto, user); // Temsilci Adý/Soyadý
            user.UpdatedAt = DateTime.UtcNow;

            _mapper.Map(dto, employer); // Þirket bilgileri
            // employer.UpdatedAt = DateTime.UtcNow; // (Eðer Employer modelinde bu alan varsa)

            // 3. Deðiþiklikleri kaydet
            await _context.SaveChangesAsync();
            _logger.LogInformation("Employer profili güncellendi (UserId: {UserId})", userId);
        }


        // ----- YARDIMCI METOT (HELPER) -----


        // Bir kullanýcýyý 'güncelleme/görüntüleme amacýyla' çeker.
        // Bu metot, IUserService.GetUserByIdAsync'ten farklý olarak:
        // 1. 'UserDto' yerine 'User' varlýðýný (entity) döndürür.
        // 2. Kullanýcýnýn 'IsActive' olduðunu doðrular (Soft Delete mantýðý).
        // 3. Kullanýcýnýn beklenen rolde (JobSeeker/Employer) olduðunu doðrular (Güvenlik).
        private async Task<User> GetUserEntityAndVerifyRoleAsync(int userId, int expectedRoleId)
        {
            var user = await _context.Users.FindAsync(userId);

            // Doðrulama 1: Kullanýcý var mý VEYA Pasif mi?
            // (IsActive kontrolü burada yapýlýyor)
            if (user == null || !user.IsActive)
            {
                throw new AppException(AppErrors.Common.NotFound, "Kullanýcý bulunamadý.");
            }

            // Doðrulama 2: Kullanýcý doðru rolde mi?
            if (user.RoleId != expectedRoleId)
            {
                _logger.LogWarning("Yetkisiz profil eriþim denemesi. (UserId: {UserId}, BeklenenRol: {RoleId})", userId, expectedRoleId);
                throw new AppException(AppErrors.Common.Forbidden, "Bu iþlem için yetkiniz yok.");
            }

            return user;
        }
    }
}
