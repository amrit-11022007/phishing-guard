package com.phishingstats.PhishingStats.repository;

import com.phishingstats.PhishingStats.model.ScanLog;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ScanLogRepo extends MongoRepository<ScanLog ,String> {
}
