using CareerMatch.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using UglyToad.PdfPig;
using Xceed.Words.NET;
using System.Text;

namespace CareerMatch.Services.Implementations {
  public class TextExtractionService : ITextExtractionService {
    public async Task<string> ExtractTextAsync(IFormFile file) {
      using var ms = new MemoryStream();
      await file.CopyToAsync(ms);
      var ext = Path.GetExtension(file.FileName).ToLowerInvariant();

      return ext switch {
        ".pdf"  => ExtractPdf(ms),
        ".docx" => ExtractDocx(ms),
        _       => Encoding.UTF8.GetString(ms.ToArray())
      };
    }

    private string ExtractPdf(MemoryStream ms) {
      ms.Position = 0;
      var sb = new StringBuilder();
      using var doc = PdfDocument.Open(ms);
      foreach (var page in doc.GetPages()) sb.AppendLine(page.Text);
      return Normalize(sb.ToString());
    }

    private string ExtractDocx(MemoryStream ms) {
      ms.Position = 0;
      using var doc = DocX.Load(ms);
      return Normalize(doc.Text);
    }

    private static string Normalize(string s) {
      if (string.IsNullOrWhiteSpace(s)) return "";
      var t = s.Replace('\0', ' ').Trim();
      return System.Text.RegularExpressions.Regex.Replace(t, @"\s+", " ");
    }
  }
}
