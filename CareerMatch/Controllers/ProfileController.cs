// Controllers/ProfileController.cs

using CareerMatch.Dtos;
using CareerMatch.Services.Interfaces;
using Microsoft.AspNetCore.Authorization; // [Authorize] için
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims; // Token'dan Claim okumak için

namespace CareerMatch.Controllers
{
    [ApiController]
    [Route("api/[controller]")] 
    [Authorize] //  Bu controller'daki tüm metotlar için "giriþ yapmýþ olmak" zorunludur.
    public class ProfileController : ControllerBase
    {
        private readonly IProfileService _profileService;

        public ProfileController(IProfileService profileService)
        {
            _profileService = profileService;
        }

        // ----- JobSeeker (Ýþ Arayan) Endpoints -----


        //  Ýþ Arayan profilini getirir.
        [HttpGet("jobseeker")] 
        [Authorize(Roles = "JobSeeker")] 
        public async Task<IActionResult> GetJobSeekerProfile()
        {
            // Token'dan alýnan ID'yi kullanarak servisi çaðýr
            var userId = GetCurrentUserId();
            var profileDto = await _profileService.GetJobSeekerProfileAsync(userId);
            
            return Ok(profileDto);
        }


        //  Ýþ Arayan profilini günceller.
        [HttpPut("jobseeker")] 
        [Authorize(Roles = "JobSeeker")] 
        public async Task<IActionResult> UpdateJobSeekerProfile([FromBody] JobSeekerProfileUpdateDto dto)
        {
            var userId = GetCurrentUserId();
            await _profileService.UpdateJobSeekerProfileAsync(userId, dto);
            
            // PATCH iþlemleri baþarýlý olduðunda 204 No Content dönmek standarttýr.
            return NoContent(); 
        }


        // ----- Employer (Ýþ Veren) Endpoints -----


        // Ýþ Veren profilini getirir. 
        [HttpGet("employer")] 
        [Authorize(Roles = "Employer")] 
        public async Task<IActionResult> GetEmployerProfile()
        {
            var userId = GetCurrentUserId();
            var profileDto = await _profileService.GetEmployerProfileAsync(userId);
            
            return Ok(profileDto);
        }


        // Ýþ Veren profilini günceller.  
        [HttpPut("employer")] 
        [Authorize(Roles = "Employer")]
        public async Task<IActionResult> UpdateEmployerProfile([FromBody] EmployerProfileUpdateDto dto)
        {
            var userId = GetCurrentUserId();
            await _profileService.UpdateEmployerProfileAsync(userId, dto);

            return NoContent();
        }


        // ----- YARDIMCI METOT (HELPER) -----

  
        // HttpContext'e eklenmiþ olan JWT Token'ý okur ve 
        // içindeki "NameIdentifier" (Kullanýcý ID) claim'ini döndürür.
        private int GetCurrentUserId()
        {
            // User (ControllerBase'den gelir) -> Giriþ yapan kullanýcýnýn token'ýndaki 'Claim'leri temsil eder
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            if (string.IsNullOrEmpty(userIdString))
            {
                // [Authorize] filtresi düzgün çalýþýyorsa bu hata asla olmamalý.
                throw new InvalidOperationException("Yetkilendirme hatasý: Kullanýcý ID'si token içinde bulunamadý.");
            }
            
            return int.Parse(userIdString);
        }
    }
}
