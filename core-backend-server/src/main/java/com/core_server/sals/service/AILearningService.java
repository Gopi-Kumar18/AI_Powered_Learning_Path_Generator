package com.core_server.sals.service;

import com.core_server.sals.document.LearningPath;
import com.core_server.sals.entity.Subject;
import com.core_server.sals.entity.QuizResult;
import com.core_server.sals.repository.*;
//import com.fasterxml.jackson.databind.JsonNode;
//import com.fasterxml.jackson.databind.ObjectMapper;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AILearningService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Autowired private LearningPathRepository mongoPathRepo;
    @Autowired private AttendanceRepository attendanceRepo;
    @Autowired private ClassSessionRepository sessionRepo;
    @Autowired private SubjectRepository subjectRepo;
    @Autowired private QuizResultRepository quizRepo;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ----- 1. Fetch existing path from MongoDB to save API calls -----
    public LearningPath getLatestPath(String studentId, String subjectCode) {
        return mongoPathRepo.findTopByStudentIdAndSubjectCodeIgnoreCaseOrderByGeneratedAtDesc(studentId, subjectCode)
                  .orElse(null);
    }

    // ----- 2. Generated a new Comprehensive roadmap for an student based on his Attendance + Quiz Results -----
    public String generateComprehensiveRoadmap(String studentId, String subjectCode) throws Exception {
        Subject subject = subjectRepo.findBySubjectCode(subjectCode).orElseThrow(() -> new RuntimeException("Subject not found for code: " + subjectCode));

        QuizResult latestQuiz = quizRepo.findTopByStudentIdAndSubjectCodeOrderByTakenAtDesc(studentId, subjectCode);

        if (latestQuiz == null) throw new RuntimeException("Take the assessment first!");

        Long internalId = subject.getId();

        int attended = attendanceRepo.countByStudentIdAndSubjectId(studentId, internalId);
        long total = sessionRepo.countValidSessionsBySubjectId(internalId);
        double attendancePercent = total == 0 ? 0 : ((double) attended / total) * 100;

        String prompt = "You are an expert academic advisor. The student scored " + latestQuiz.getScore() + "/3 on their assessment and has an attendance rate of " + Math.round(attendancePercent) + "%. " +
                "Based on this syllabus: '" + subject.getSyllabusText() + "', generate a highly personalized, 4-week/6-week/8-week(depending upon his attendance + quiz results) study roadmap in clean Markdown. " +
                "CRITICAL FORMATTING RULES: " +
                "1. Start each week with an H2 header (e.g., '## Week 1: Topic Name'). " +
                "2. Put a horizontal rule ('---') exactly before every new Week (except the first one). " +
                "3. Start every single day with an H3 header on a new line (e.g., '### Day 1: Subtopic'). " +
                "4. Use bullet points for the day's tasks. " +
                "5. Keep paragraphs short and avoid walls of text.";

        String finalMarkdown = callGeminiApi(prompt);

        LearningPath path = new LearningPath();
        path.setStudentId(studentId);
        path.setSubjectCode(subject.getSubjectCode());
        path.setCurrentAttendancePercentage(attendancePercent);
        path.setAiGeneratedRoadmap(finalMarkdown);
        path.setGeneratedAt(java.time.LocalDateTime.now());
        mongoPathRepo.save(path);

        return finalMarkdown;
    }

    // ----- 3. Calls the Gemini API for generating AI based Roadmap -----
    private String callGeminiApi(String prompt) {
        try {
            String fullUrl = geminiApiUrl + geminiApiKey;

            Map<String, Object> textPart = Map.of("text", prompt);
            Map<String, Object> parts = Map.of("parts", List.of(textPart));
            Map<String, Object> requestBody = Map.of("contents", List.of(parts));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            String responseStr = restTemplate.postForObject(fullUrl, request, String.class);

            // Parse the heavily nested JSON response
            JsonNode rootNode = objectMapper.readTree(responseStr);
            return rootNode.path("candidates").get(0)
                    .path("content")
                    .path("parts").get(0)
                    .path("text").asText();

        } catch (Exception e) {
            e.printStackTrace();
            return "Failed to generate roadmap. Please try again later.";
        }
    }
}