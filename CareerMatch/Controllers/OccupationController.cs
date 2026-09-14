// Controllers/OccupationsController.cs

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
    [Route("api/occupation")] 
    public class OccupationsController : ControllerBase
    {
        // Özel bir OccupationService yerine GenericService kullanýyoruz
        private readonly IGenericService<Occupation> _occupationService;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;

        public OccupationsController(IGenericService<Occupation> occupationService, IMapper mapper, IMemoryCache cache)
        {
            _occupationService = occupationService;
            _mapper = mapper;
            _cache = cache;
        }


        // Tüm meslekleri listeler.
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            if (_cache.TryGetValue("all_occupations", out IEnumerable<OccupationDto>? cachedDtos))
            {
                return Ok(cachedDtos);
            }

            // 1. Modelleri servisten al
            var occupations = await _occupationService.GetAllAsync();

            // 2. Modelleri DTO'ya dönüþtür
            var occupationDtos = _mapper.Map<IEnumerable<OccupationDto>>(occupations);
            
            _cache.Set("all_occupations", occupationDtos, TimeSpan.FromHours(1));

            return Ok(occupationDtos);
        }


        // ID'ye göre tek bir mesleði getirir.
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var occupation = await _occupationService.GetByIdAsync(id);

            if (occupation == null)
            {
                return NotFound("Meslek bulunamadý."); // 404
            }

            var occupationDto = _mapper.Map<OccupationDto>(occupation);
            return Ok(occupationDto);
        }


        // Yeni bir meslek oluþturur. (Admin'e özel)
        [HttpPost]
        [Authorize(Roles = "Admin")] 
        public async Task<IActionResult> Create([FromBody] OccupationCreateDto dto)
        {
            // 1. DTO'yu Modele dönüþtür
            var occupation = _mapper.Map<Occupation>(dto);
            
            occupation.CreatedAt = DateTime.UtcNow;

            // 2. Servis ile ekle
            await _occupationService.AddAsync(occupation);
            await _occupationService.SaveChangesAsync();

            // 3. Baþarýlý yanýt için modeli DTO'ya geri dönüþtür
            var occupationDto = _mapper.Map<OccupationDto>(occupation);

            // 201 Created yanýtý 
            return CreatedAtAction(nameof(GetById), new { id = occupationDto.Id }, occupationDto);
        }


        // Mevcut bir mesleði günceller. (Admin'e özel)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] OccupationUpdateDto dto)
        {
            // 1. Mevcut kaydý bul
            var occupation = await _occupationService.GetByIdAsync(id);
            if (occupation == null)
            {
                return NotFound("Güncellenecek meslek bulunamadý.");
            }

            // 2. DTO'dan gelen verileri mevcut 'occupation' nesnesi üzerine haritala
            _mapper.Map(dto, occupation);
            
            occupation.UpdatedAt = DateTime.UtcNow;

            // 3. Servis ile güncelle (EF Core bu deðiþikliði anlar)
            _occupationService.Update(occupation); // Sadece state'i 'Modified' olarak iþaretler
            await _occupationService.SaveChangesAsync();

            return NoContent(); // 204 No Content (Baþarýlý PUT için standart yanýt)
        }


        // Bir mesleði siler. (Admin'e özel)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var occupation = await _occupationService.GetByIdAsync(id);
            if (occupation == null)
            {
                return NotFound("Silinecek meslek bulunamadý.");
            }
            
            _occupationService.Delete(occupation);
            await _occupationService.SaveChangesAsync();

            return NoContent(); // 204 No Content
        }
    }
}
