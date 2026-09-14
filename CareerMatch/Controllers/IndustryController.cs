// Controllers/IndustryController.cs

using AutoMapper;
using CareerMatch.Dtos;
using CareerMatch.Models; 
using CareerMatch.Services.Interfaces; 
using Microsoft.AspNetCore.Authorization; 
using Microsoft.AspNetCore.Mvc;

namespace CareerMatch.Controllers
{

    [ApiController]
    [Route("api/[controller]")] 
    public class IndustryController : ControllerBase
    {
        // Özel bir IndustryService yerine GenericService kullanýyoruz
        private readonly IGenericService<Industry> _industryService;
        private readonly IMapper _mapper;

        public IndustryController(IGenericService<Industry> industryService, IMapper mapper)
        {
            _industryService = industryService;
            _mapper = mapper;
        }


        // Tüm sektörleri listeler.
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            // 1. Modelleri servisten al
            var industries = await _industryService.GetAllAsync();

            // 2. Modelleri DTO'ya dönüþtür
            var industryDtos = _mapper.Map<IEnumerable<IndustryDto>>(industries);

            return Ok(industryDtos);
        }


        // ID'ye göre tek bir sektörü getirir. (Admin'e özel)
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")] 
        public async Task<IActionResult> GetById(int id)
        {
            var industry = await _industryService.GetByIdAsync(id);

            if (industry == null)
            {
                return NotFound("Sektör bulunamadý."); // 404
            }

            var industryDto = _mapper.Map<IndustryDto>(industry);
            return Ok(industryDto);
        }


        // Yeni bir sektör oluþturur. (Admin'e özel)
        [HttpPost]
        [Authorize(Roles = "Admin")] 
        public async Task<IActionResult> Create([FromBody] IndustryCreateDto dto)
        {
            // 1. DTO'yu Modele dönüþtür
            var industry = _mapper.Map<Industry>(dto);
            
            industry.CreatedAt = DateTime.UtcNow;

            // 2. Servis ile ekle
            await _industryService.AddAsync(industry);
            await _industryService.SaveChangesAsync(); 

            // 3. Baþarýlý yanýt için modeli DTO'ya geri dönüþtür
            var industryDto = _mapper.Map<IndustryDto>(industry);

            // 201 Created yanýtý 
            return CreatedAtAction(nameof(GetById), new { id = industryDto.Id }, industryDto);
        }
         
        
        // Mevcut bir sektörü günceller. (Admin'e özel)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] IndustryUpdateDto dto)
        {
            // 1. Mevcut kaydý bul
            var industry = await _industryService.GetByIdAsync(id);
            if (industry == null)
            {
                return NotFound("Güncellenecek sektör bulunamadý.");
            }

            // 2. DTO'dan gelen verileri mevcut 'industry' nesnesi üzerine haritala
            _mapper.Map(dto, industry);
            
            industry.UpdatedAt = DateTime.UtcNow;

            // 3. Servis ile güncelle
            _industryService.Update(industry);
            await _industryService.SaveChangesAsync();

            return NoContent(); // 204 No Content
        }


        // Bir sektörü siler. (Admin'e özel)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var industry = await _industryService.GetByIdAsync(id);
            if (industry == null)
            {
                return NotFound("Silinecek sektör bulunamadý.");
            }

            _industryService.Delete(industry);
            await _industryService.SaveChangesAsync();

            return NoContent(); // 204 No Content
        }
    }
}
