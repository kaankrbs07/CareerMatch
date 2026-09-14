using System.Threading.Tasks;

namespace CareerMatch.Services.Interfaces {
  public interface IAiClient {
    /// <summary>
    /// Generic match method.
    /// Can be used for:
    /// 1. Recommend Jobs: queryText = CV, candidates = Jobs
    /// 2. Find Candidates: queryText = JobDescription, candidates = CVs
    /// </summary>
    Task<MatchResponseDto> MatchAsync(string queryText, IEnumerable<AiMatchCandidate> documents,
                                      int? topK = null, double? scoreThreshold = null);
  }

  public record AiMatchCandidate(string id, string text, List<string>? tags);
  public record MatchItemDto(string id, double score, double emb, double kw, double tag, string text);
  public record MatchResponseDto(string lang, List<MatchItemDto> results);
}
