export interface EmailData {
  senderEmail: string | null;
  senderName: string | null;
  subject: string | null;
  body: string | null;
  links: string[];
}

export interface AnalyzeResponse {
  phishing: { isPhishing: boolean; confidence: number };
  aiGenerated: { isAI: boolean; confidence: number };
}

export type AnalysisMode = "auto" | "manual";

export interface EmailExtractResult {
  senderEmail: string | null;
  senderName: string | null;
  subject: string | null;
  body: string | null;
  links: string[];
  error?: string;
}
