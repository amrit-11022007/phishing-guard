package com.phishingstats.PhishingStats.controller;

import com.phishingstats.PhishingStats.dto.ScanLogResponse;
import com.phishingstats.PhishingStats.model.ScanLog;
import com.phishingstats.PhishingStats.service.ScanLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ScanLogController {

    @Autowired
    private ScanLogService service;

    @PostMapping("/contracts")
    public ScanLogResponse saveScan(@RequestBody ScanLog log) {
        return service.save(log);
    }
}