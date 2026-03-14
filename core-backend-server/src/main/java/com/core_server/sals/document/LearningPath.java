package com.core_server.sals.document;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "learning_paths")
public class LearningPath {

    @Id
    private String id;

    private String studentId; // Links back to your MySQL User table!

    private String subject;

    private double currentAttendancePercentage;

    private String aiGeneratedRoadmap;

    private LocalDateTime generatedAt;
}