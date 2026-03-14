package com.core_server.sals.controller;

import com.core_server.sals.document.LearningPath;
import com.core_server.sals.entity.QuizResult;
import com.core_server.sals.repository.QuizResultRepository;
import com.core_server.sals.service.AILearningService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIController {

    @Autowired private AILearningService aiLearningService;
    @Autowired private QuizResultRepository quizResultRepo;

    // ----- 1. Return Already Generated AI Roadmap from MongoDB -----
    @GetMapping("/path/{studentId}/{subject}")
    public Map<String, Object> getPath(@PathVariable String studentId, @PathVariable String subject) {
        LearningPath path = aiLearningService.getLatestPath(studentId, subject);

        if (path == null) {
            return Map.of("status", "NOT_FOUND", "message", "No roadmap generated yet.");
        }
        return Map.of("status", "SUCCESS", "data", path);
    }


    // ----- 2. Saving Quiz Result in MysqlDB -----
    @PostMapping("/quiz/submit")
    public Map<String, Object> submitQuizScore(@RequestBody QuizResult result) {
        quizResultRepo.save(result);
        return Map.of("status", "SUCCESS");
    }

    // ----- 3. Generate Final AI Roadmap for an student based on his Attendance + Quiz Result -----
    @GetMapping("/path/comprehensive/{studentId}/{subjectId}")
    public Map<String, Object> getComprehensivePath(@PathVariable String studentId, @PathVariable Long subjectId) {
        try {
            String markdownRoadmap = aiLearningService.generateComprehensiveRoadmap(studentId, subjectId);
            return Map.of("status", "SUCCESS", "roadmap", markdownRoadmap);
        } catch (Exception e) {
            return Map.of("status", "ERROR", "message", e.getMessage());
        }
    }
}
