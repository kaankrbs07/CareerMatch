using AutoMapper;
using CareerMatch.Dtos;
using CareerMatch.Models;
using CareerMatch.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace CareerMatch.Controllers
{
    [ApiController]
    [Route("api/role")]
    public class RoleController : ControllerBase
    {
        private readonly IGenericService<Role> _roleService;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;

        public RoleController(IGenericService<Role> roleService, IMapper mapper, IMemoryCache cache)
        {
            _roleService = roleService;
            _mapper = mapper;
            _cache = cache;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            if (_cache.TryGetValue("all_roles", out IEnumerable<RoleDto>? cachedDtos))
            {
                return Ok(cachedDtos);
            }

            var roles = await _roleService.GetAllAsync();
            var roleDtos = _mapper.Map<IEnumerable<RoleDto>>(roles);

            _cache.Set("all_roles", roleDtos, TimeSpan.FromHours(1));

            return Ok(roleDtos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var role = await _roleService.GetByIdAsync(id);

            if (role == null)
            {
                return NotFound("Rol bulunamadı.");
            }

            var roleDto = _mapper.Map<RoleDto>(role);
            return Ok(roleDto);
        }

        // Admin endpoints
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] RoleCreateDto dto)
        {
            var role = _mapper.Map<Role>(dto);
            await _roleService.AddAsync(role);
            await _roleService.SaveChangesAsync();

            var roleDto = _mapper.Map<RoleDto>(role);
            return CreatedAtAction(nameof(GetById), new { id = roleDto.Id }, roleDto);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] RoleUpdateDto dto)
        {
            var role = await _roleService.GetByIdAsync(id);
            if (role == null)
            {
                return NotFound("Güncellenecek rol bulunamadı.");
            }

            _mapper.Map(dto, role);
            _roleService.Update(role);
            await _roleService.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var role = await _roleService.GetByIdAsync(id);
            if (role == null)
            {
                return NotFound("Silinecek rol bulunamadı.");
            }

            _roleService.Delete(role);
            await _roleService.SaveChangesAsync();

            return NoContent();
        }
    }
}

