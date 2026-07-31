package com.phishingstats.PhishingStats.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "phishers")
public class ScanLog {

    @Id
    private String id;
    private String userId;
    private EmailMetadata emailMetadata;
    private Analysis analysis;
    private Extension extension;
}
