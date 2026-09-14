// MappingProfiles/IndustryProfile.cs

using AutoMapper;
using CareerMatch.Dtos;
using CareerMatch.Models; // Industry modelimizin yolu

namespace CareerMatch.MappingProfiles
{
    public class IndustryProfile : Profile
    {
        public IndustryProfile()
        {
            // Okuma (GET) için: Model -> DTO
            CreateMap<Industry, IndustryDto>();

            // Oluþturma (POST) için: DTO -> Model
            CreateMap<IndustryCreateDto, Industry>();

            // Güncelleme (PUT) için: DTO -> Model
            CreateMap<IndustryUpdateDto, Industry>();
        }
    }
}
