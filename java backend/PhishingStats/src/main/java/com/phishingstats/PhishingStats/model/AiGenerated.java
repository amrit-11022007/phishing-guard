package com.phishingstats.PhishingStats.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

enum AiProbability{
    human , likely_human , uncertain , likely_at , ai
}
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AiGenerated {
    private boolean isAI;
    private double confidence;
    private AiProbability aiProbability;
}
