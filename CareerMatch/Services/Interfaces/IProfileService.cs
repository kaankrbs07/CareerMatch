// Services/Interfaces/IProfileService.cs

using CareerMatch.Dtos;

namespace CareerMatch.Services.Interfaces
{
    public interface IProfileService
    { 
        
        // Belirtilen 'userId'ye sahip Ýþ Arayanýn birleþik profilini (User + JobSeeker) getirir. 
        
        Task<JobSeekerProfileUpdateDto> GetJobSeekerProfileAsync(int userId);

  
        // Belirtilen 'userId'ye sahip Ýþ Arayanýn profilini (User ve JobSeeker tablolarý) günceller. 
        
        Task UpdateJobSeekerProfileAsync(int userId, JobSeekerProfileUpdateDto dto);

        


        // Belirtilen 'userId'ye sahip Ýþ Verenin birleþik profilini (User + Employer) getirir.  
        
        Task<EmployerProfileUpdateDto> GetEmployerProfileAsync(int userId);

     
        // Belirtilen 'userId'ye sahip Ýþ Verenin profilini (User ve Employer tablolarý) günceller.

        Task UpdateEmployerProfileAsync(int userId, EmployerProfileUpdateDto dto);
    }
}
