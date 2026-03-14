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
    public LearningPath getLatestPath(String studentId, String subject) {
        Optional<LearningPath> pathOpt = mongoPathRepo.findTopByStudentIdAndSubjectOrderByGeneratedAtDesc(studentId, subject);
        return pathOpt.orElse(null);
    }

    // ----- 2. Generated a new Comprehensive roadmap for an student based on his Attendance + Quiz Results -----
    public String generateComprehensiveRoadmap(String studentId, Long subjectId) throws Exception {
        Subject subject = subjectRepo.findById(subjectId).orElseThrow();
        QuizResult latestQuiz = quizRepo.findTopByStudentIdAndSubjectIdOrderByTakenAtDesc(studentId, subjectId);

        if (latestQuiz == null) throw new RuntimeException("Take the assessment first!");

        int attended = attendanceRepo.countByStudentIdAndSubjectId(studentId, subjectId);
        long total = sessionRepo.countValidSessionsBySubjectId(subjectId);
        double attendancePercent = total == 0 ? 0 : ((double) attended / total) * 100;

        String prompt = "You are an expert academic advisor. The student scored " + latestQuiz.getScore() + "/3 on their recent assessment and has an attendance rate of " + Math.round(attendancePercent) + "%. " +
                "Based on this syllabus: '" + subject.getSyllabusText() + "', generate a highly personalized, 4-week study roadmap in clean Markdown. " +
                "Address their specific performance blend (e.g., high attendance but low score means they need better study methods; low attendance and low score means they need core fundamentals).";

        String finalMarkdown = callGeminiApi(prompt);

        LearningPath path = new LearningPath();
        path.setStudentId(studentId);
        path.setSubject(subject.getName());
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