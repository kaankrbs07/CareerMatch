// MappingProfiles/EmployerProfiles.cs

using AutoMapper;
using CareerMatch.Dtos;
using CareerMatch.Models;

namespace CareerMatch.MappingProfiles
{
    public class EmployerProfile : Profile
    {
        public EmployerProfile()
        {
            
            // 'FirstName' ve 'LastName' (temsilci adý/soyadý) alanlarýný eþleþtirecek. 
            CreateMap<User, EmployerProfileUpdateDto>()
                .ReverseMap();


            // 'CompanyName', 'Email' (þirket maili), 'PhoneNumber' vb. alanlarý eþleþtirecek. 
            CreateMap<Employer, EmployerProfileUpdateDto>()
                .ReverseMap();
        }
    }
}
