/** A link in the app, or an action the UI runs (sending an invoice reminder). */
export type AssistantAction = { label: string; href: string; kind?: undefined } | { label: string; kind: "remind"; invoice_id: string; href?: undefined };

/** POST /v1/assistant/ask */
export interface AssistantAnswer {
  answer: string;
  intent: string | null;
  confidence: number | null;
  /** "model": VergePay's own small model; "words": its fallback; "llm": the optional open model picked */
  matched_by: "model" | "words" | "llm";
  /** "llm" when the optional open model reworded VergePay's answer */
  worded_by: "vergepay" | "llm";
  actions: AssistantAction[];
  followups: string[];
}

/** GET /v1/recommendations */
export interface Recommendation {
  key: string;
  kind: "collect" | "loan" | "payroll" | "billing" | "save" | "insight" | "account";
  tone: "urgent" | "warning" | "tip" | "info";
  priority: number;
  title: string;
  body: string;
  action: AssistantAction;
}
