// MappingProfiles/OccupationProfile.cs

using AutoMapper;
using CareerMatch.Dtos;
using CareerMatch.Models; // Occupation modelimizin yolu

namespace CareerMatch.MappingProfiles
{
    public class OccupationProfile : Profile
    {
        public OccupationProfile()
        {
            // Okuma (GET) için: Model -> DTO
            CreateMap<Occupation, OccupationDto>();

            // Oluþturma (POST) için: DTO -> Model
            CreateMap<OccupationCreateDto, Occupation>();

            // Güncelleme (PUT) için: DTO -> Model
            CreateMap<OccupationUpdateDto, Occupation>();
        }
    }
}
