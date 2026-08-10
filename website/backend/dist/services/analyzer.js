"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeText = analyzeText;
/**
 * Heuristics-based analysis engine to check for phishing indicators
 * and estimate if the content is AI generated.
 */
function analyzeText(text) {
    const normalized = text.toLowerCase();
    // 1. Phishing Heuristics
    const phishingKeywords = [
        "verify your account",
        "password reset",
        "security alert",
        "account suspended",
        "urgent action required",
        "update billing",
        "invoice payment",
        "login to your bank",
        "click here to login",
        "immediate action",
        "compromised",
        "paypal-secure",
        "identity verification",
        "unusual activity",
        "win money",
        "gift card",
    ];
    let keywordHits = 0;
    phishingKeywords.forEach((keyword) => {
        if (normalized.includes(keyword)) {
            keywordHits++;
        }
    });
    // Check for presence of links in text
    const linkMatches = text.match(/https?:\/\/[^\s]+/g) || [];
    let suspiciousLinks = 0;
    linkMatches.forEach((link) => {
        const domainMatch = link.match(/https?:\/\/([^\/\s]+)/);
        if (domainMatch) {
            const domain = domainMatch[1].toLowerCase();
            // Check for common phishing patterns in URLs
            const suspiciousPatterns = ["verify", "secure", "update", "bank", "login", "signin", "support", "check"];
            suspiciousPatterns.forEach((pattern) => {
                if (domain.includes(pattern) && !domain.includes("google.com") && !domain.includes("microsoft.com") && !domain.includes("github.com")) {
                    suspiciousLinks++;
                }
            });
        }
    });
    // Calculate phishing confidence
    let phishingScore = 0.05; // Base rate
    phishingScore += keywordHits * 0.25;
    phishingScore += suspiciousLinks * 0.35;
    if (normalized.includes("urgent") || normalized.includes("immediate")) {
        phishingScore += 0.15;
    }
    // Clamp between 0.05 and 0.98
    phishingScore = Math.max(0.05, Math.min(0.98, phishingScore));
    const isPhishing = phishingScore > 0.45;
    let riskLevel = "low";
    if (phishingScore >= 0.8) {
        riskLevel = "critical";
    }
    else if (phishingScore >= 0.55) {
        riskLevel = "high";
    }
    else if (phishingScore >= 0.3) {
        riskLevel = "medium";
    }
    // 2. AI-Generated Heuristics
    // AI tends to use specific transition words, have very uniform sentence lengths, and lack spelling/grammar errors.
    const aiKeywords = [
        "furthermore",
        "moreover",
        "in conclusion",
        "it is important to note",
        "testament to",
        "delve",
        "consequently",
        "underscores the importance",
        "as a result",
        "not only... but also",
    ];
    let aiHits = 0;
    aiKeywords.forEach((keyword) => {
        if (normalized.includes(keyword)) {
            aiHits++;
        }
    });
    // Simple deterministic scoring based on character code hashing to stay consistent for the same text
    let textHash = 0;
    for (let i = 0; i < Math.min(text.length, 100); i++) {
        textHash += text.charCodeAt(i);
    }
    const deterministicFactor = (textHash % 100) / 100;
    let aiScore = 0.1; // Base rate
    aiScore += aiHits * 0.2;
    aiScore += (1 - Math.abs(deterministicFactor - 0.5)) * 0.4; // Hash factor
    // Clamp AI score
    aiScore = Math.max(0.05, Math.min(0.96, aiScore));
    const isAI = aiScore > 0.5;
    let aiProbability = "human";
    if (aiScore >= 0.8) {
        aiProbability = "ai";
    }
    else if (aiScore >= 0.6) {
        aiProbability = "likely_ai";
    }
    else if (aiScore >= 0.4) {
        aiProbability = "uncertain";
    }
    else if (aiScore >= 0.2) {
        aiProbability = "likely_human";
    }
    return {
        phishing: {
            isPhishing,
            confidence: parseFloat(phishingScore.toFixed(2)),
            riskLevel,
        },
        aiGenerated: {
            isAI,
            confidence: parseFloat(aiScore.toFixed(2)),
            aiProbability,
        },
    };
}
