import { api } from "@/lib/api";
import { AssistantAnswer, Recommendation } from "@/types/assistant";

/** Answers from the customer's own figures (the API never stores the question). */
export function askAssistant(question: string) {
  return api<AssistantAnswer>("/v1/assistant/ask", { method: "POST", body: JSON.stringify({ question }) });
}

export function assistantSuggestions() {
  return api<{ questions: string[]; open_model: boolean }>("/v1/assistant/suggestions");
}

export function listRecommendations(limit = 5) {
  return api<{ data: Recommendation[]; total: number }>(`/v1/recommendations?limit=${limit}`);
}

/** Hides a recommendation for `days` (7 by default). */
export function dismissRecommendation(key: string, days?: number) {
  return api<{ key: string; dismissed_for_days: number }>(`/v1/recommendations/${encodeURIComponent(key)}/dismiss`, {
    method: "POST",
    body: JSON.stringify(days ? { days } : {}),
  });
}
