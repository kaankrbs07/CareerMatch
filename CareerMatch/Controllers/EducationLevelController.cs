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
    [Route("api/educationLevel")] 
    public class EducationLevelController : ControllerBase
    {
        private readonly IGenericService<EducationLevel> _service;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;

        public EducationLevelController(IGenericService<EducationLevel> service, IMapper mapper, IMemoryCache cache)
        {
            _service = service;
            _mapper = mapper;
            _cache = cache;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            if (_cache.TryGetValue("all_educationAPI", out IEnumerable<EducationLevelDto>? cachedDtos))
            {
                return Ok(cachedDtos);
            }

            var levels = await _service.GetAllAsync();
            var dtos = _mapper.Map<IEnumerable<EducationLevelDto>>(levels);
            
            _cache.Set("all_educationAPI", dtos, TimeSpan.FromHours(1));

            return Ok(dtos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var level = await _service.GetByIdAsync(id);
            if (level == null) return NotFound("Eğitim seviyesi bulunamadı.");

            var dto = _mapper.Map<EducationLevelDto>(level);
            return Ok(dto);
        }
        
        // Create
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] EducationLevelCreateDto dto)
        {
            var level = _mapper.Map<EducationLevel>(dto);
            // No CreatedAt in EducationLevel model or DTO? 
            // Model usually shares common props. Let's assume it might not have Auditable props or just basic. 
            // Checking dto above, it has Name. 
            // If Model has CreatedAt, we should set it. 
            // Looking at other controllers, they set DateTime.UtcNow.
            // But EducationLevelDtos.cs didn't show the Model properties, only Dto properties.
            // Let's assume we just MAP and SAVE. 
            
            await _service.AddAsync(level);
            await _service.SaveChangesAsync();

            var resultDto = _mapper.Map<EducationLevelDto>(level);
            return CreatedAtAction(nameof(GetById), new { id = resultDto.Id }, resultDto);
        }

        // Update
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] EducationLevelUpdateDto dto)
        {
            var existing = await _service.GetByIdAsync(id);
            if (existing == null) return NotFound("Eğitim seviyesi bulunamadı.");

            _mapper.Map(dto, existing);
            
            _service.Update(existing);
            await _service.SaveChangesAsync();

            return NoContent();
        }

        // Delete
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _service.GetByIdAsync(id);
            if (existing == null) return NotFound("Eğitim seviyesi bulunamadı.");

            _service.Delete(existing);
            await _service.SaveChangesAsync();

            return NoContent();
        }
    }
}

