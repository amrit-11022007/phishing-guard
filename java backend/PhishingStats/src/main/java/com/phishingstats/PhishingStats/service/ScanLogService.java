package com.phishingstats.PhishingStats.service;

import com.phishingstats.PhishingStats.dto.ScanLogResponse;
import com.phishingstats.PhishingStats.model.ScanLog;
import com.phishingstats.PhishingStats.repository.ScanLogRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ScanLogService {

    @Autowired
    private ScanLogRepo repo;

    public ScanLogResponse save(ScanLog log) {
        ScanLog saved = repo.save(log);
        if(saved!= null){
            return new ScanLogResponse(true, saved.getId(), "Data sent successfully");
        }
        else {
            return new ScanLogResponse(false , "Id not found" , "Internal Server Error");
        }
    }
}
