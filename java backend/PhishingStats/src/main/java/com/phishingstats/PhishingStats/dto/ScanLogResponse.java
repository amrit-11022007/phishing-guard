package com.phishingstats.PhishingStats.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ScanLogResponse {
    private boolean success;
    private String scanId;
    private String message;
}
