package com.core_server.sals.controller;

import com.core_server.sals.service.AIQuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIQuizController {

    @Autowired private AIQuizService aiQuizService;

    // ----- 1. Generates & Return AI based Quiz Questions in JSON String to frontend-----
    @GetMapping("/quiz/generate/{studentId}/{subjectId}")
    public Map<String, Object> generateQuiz(
            @PathVariable String studentId,
            @PathVariable Long subjectId) {
        try {
            String quizJson = aiQuizService.generateQuiz(studentId, subjectId);
            return Map.of("status", "SUCCESS", "quizData", quizJson);
        } catch (Exception e) {
            return Map.of("status", "ERROR", "message", e.getMessage());
        }
    }
}
