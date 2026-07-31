package com.phishingstats.PhishingStats.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Extension {
    private String version;
    private String browser;
    private String timestamp;
}
