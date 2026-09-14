// MappingProfiles/UserProfiles.cs

using AutoMapper;
using CareerMatch.Dtos;
using CareerMatch.Models;

namespace CareerMatch.MappingProfiles
{
    public class UserProfile : Profile
    {
        public UserProfile()
        {

            // User -> UserDto (Tek Yönlü)
            CreateMap<User, UserDto>()
                .ForMember(
                    dest => dest.RoleName, 
                    opt => opt.MapFrom(src => src.Role.Name)
                );

            // RegisterRequestDto -> User (Tek Yönlü)
            CreateMap<RegisterRequestDto, User>();
        }
    }
}
