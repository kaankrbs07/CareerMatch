using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace CareerMatch.Services.Interfaces {
  public interface ITextExtractionService {
    Task<string> ExtractTextAsync(IFormFile file);
  }
}

