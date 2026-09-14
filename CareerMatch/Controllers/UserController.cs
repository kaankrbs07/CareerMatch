// Controllers/UsersController.cs

using CareerMatch.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CareerMatch.Controllers
{

    [ApiController]
    [Route("api/[controller]")] 
    [Authorize(Roles = "Admin")] //  Bu controller'a sadece Admin'ler eriþebilir
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        // Not: Bu controller'daki metotlar servisten hazýr UserDto döndürdüðü
        // için IMapper'a  ihtiyaç duymuyoruz.
        public UsersController(IUserService userService)
        {
            _userService = userService;
        }


        // Sistemdeki tüm kullanýcýlarý listeler. 
        [HttpGet] 
        public async Task<IActionResult> GetAllUsers()
        {
            // IUserService.GetAllUsersAsync() metodu zaten bize
            // güvenli 'UserDto' listesini döndürüyor.
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }


        // ID'ye göre tek bir kullanýcýyý getirir. 
        [HttpGet("{id}")] 
        public async Task<IActionResult> GetUserById(int id)
        {
            // IUserService.GetUserByIdAsync() metodu bize
            // güvenli 'UserDto' veya 'null' döndürüyor.
            var user = await _userService.GetUserByIdAsync(id);

            if (user == null)
            {
                // UserService, IsActive=false olanlarý da 'null' döndürür
                // Her iki durumda da 404 dönüyoruz.
                return NotFound("Kullanýcý bulunamadý.");
            }

            return Ok(user);
        }
    }
}
