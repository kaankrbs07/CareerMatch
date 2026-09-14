using AutoMapper;
using CareerMatch.Dtos;
using CareerMatch.Models; 

namespace CareerMatch.MappingProfiles
{
    public class EducationLevelProfile : Profile
    {
        public EducationLevelProfile()
        {
            CreateMap<EducationLevel, EducationLevelDto>();
            CreateMap<EducationLevelCreateDto, EducationLevel>();
            CreateMap<EducationLevelUpdateDto, EducationLevel>();
        }
    }
}

