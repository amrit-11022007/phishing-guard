package com.phishingstats.PhishingStats.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

enum RiskLevel {
    low,
    medium,
    high,
    critical
}

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Phishing {
    private boolean isPhishing;
    private double confidence;
    private RiskLevel riskLevel;
}
