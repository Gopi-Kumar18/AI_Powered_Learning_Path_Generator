package com.core_server.sals.repository;


import com.core_server.sals.document.LearningPath;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface LearningPathRepository extends MongoRepository<LearningPath, String> {

    // Find the most recent roadmap generated for a specific student and subject
    Optional<LearningPath> findTopByStudentIdAndSubjectOrderByGeneratedAtDesc(String studentId, String subject);
}

