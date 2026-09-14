using CareerMatch.Services.Interfaces;
using System.Net.Http.Json;

namespace CareerMatch.Services.Implementations;

public class AiClient : IAiClient {
  private readonly HttpClient _http;
  private readonly ILogger<AiClient> _log;
  public AiClient(HttpClient http, ILogger<AiClient> log) { _http = http; _log = log; }

  public async Task<MatchResponseDto> MatchAsync(string queryText, IEnumerable<AiMatchCandidate> documents,
                                                 int? topK = null, double? scoreThreshold = null) {
    // Python API "cv_text" ve "jobs" bekliyor.
    // Biz buraya generic query/docs gönderiyoruz.
    // Eşleştirme simetrik sayılabileceği için mapping:
    // query -> cv_text
    // documents -> jobs
    var body = new {
      cv_text = queryText,
      jobs = documents, // JSON property otomatik "jobs" olmaz, anonim object'te property ismi önemli
      top_k = topK,
      score_threshold = scoreThreshold
    };
    
    var resp = await _http.PostAsJsonAsync("/v1/match", body);
    resp.EnsureSuccessStatusCode();
    return (await resp.Content.ReadFromJsonAsync<MatchResponseDto>())!;
  }
}
