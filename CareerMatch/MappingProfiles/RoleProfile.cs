using AutoMapper;
using CareerMatch.Dtos;
using CareerMatch.Models;

namespace CareerMatch.MappingProfiles
{
    public class RoleProfile : Profile
    {
        public RoleProfile()
        {
            CreateMap<Role, RoleDto>();
            CreateMap<RoleCreateDto, Role>();
            CreateMap<RoleUpdateDto, Role>();
        }
    }
}

