// MappingProfiles/JobSeekerProfile.cs

using AutoMapper;
using CareerMatch.Dtos;
using CareerMatch.Models;

namespace CareerMatch.MappingProfiles
{
    public class JobSeekerProfile : Profile
    {
        public JobSeekerProfile()
        {
            // JobSeekerProfileUpdateDto <-> User
            // Sadece 'FirstName' ve 'LastName' alanlarýný eþleþtirecek.  
            CreateMap<User, JobSeekerProfileUpdateDto>()
                .ReverseMap();     
  
            
            
            // JobSeekerProfileUpdateDto <-> JobSeeker
            // 'Country', 'City', 'ExperienceYears' vb. alanlarý eþleþtirecek. 
            CreateMap<JobSeeker, JobSeekerProfileUpdateDto>()
                .ReverseMap();         
        }
    }
}
