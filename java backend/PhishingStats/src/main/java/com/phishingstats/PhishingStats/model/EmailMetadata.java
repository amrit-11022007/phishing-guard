package com.phishingstats.PhishingStats.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmailMetadata {

    private String senderEmail;
    private String senderDomain;
    private int subjectLength;
    private int bodyLength;
    private int linkCount;
}
