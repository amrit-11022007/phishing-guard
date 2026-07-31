package com.phishingstats.PhishingStats.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

enum ScanType {
    email,
    manual_paste
}

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Analysis {

    private ScanType scanType;
    private String timestamp;
    private long duration;
    private Phishing phishing;
    private AiGenerated aiGenerated;
}
