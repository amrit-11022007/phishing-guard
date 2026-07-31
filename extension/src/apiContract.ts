// Add this to your definitions.ts
export interface ScanLogRequest {
  // User Identification
  userId: string; // Chrome extension unique ID

  // Email Context (anonymized for privacy)
  emailMetadata: {
    senderDomain: string | null; // e.g., "gmail.com" (domain only, not full email)
    subjectLength: number; // Length of subject (not content)
    bodyLength: number; // Length of body (not content)
    linkCount: number; // How many links in email
  };

  // Analysis Results
  analysis: {
    scanType: "email" | "manual_paste"; // How was it scanned?
    timestamp: string; // ISO 8601
    duration: number; // How long ML analysis took (ms)

    phishing: {
      isPhishing: boolean;
      confidence: number; // 0-1 float (convert percentage obtained into decimal)
      riskLevel: "low" | "medium" | "high" | "critical";
    };

    aiGenerated: {
      isAI: boolean;
      confidence: number; // 0-1 float (convert percentage obtained into decimal)
      aiProbability:
        | "human"
        | "likely_human"
        | "uncertain"
        | "likely_ai"
        | "ai";
    };
  };

  // Extension Metadata
  extension: {
    version: string; // Your extension version
    browser: string; // "chrome" | "firefox" | etc.
    timestamp: string; // When extension sent this
  };
}

export interface ScanLogResponse {
  success: boolean;
  scanId: string; // MongoDB ObjectId as string
  message: string;
}
