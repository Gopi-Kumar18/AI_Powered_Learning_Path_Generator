package com.core_server.sals.service;

import com.core_server.sals.entity.Subject;
import com.core_server.sals.repository.AttendanceRepository;
import com.core_server.sals.repository.ClassSessionRepository;
import com.core_server.sals.repository.SubjectRepository;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class AIQuizService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Autowired private AttendanceRepository attendanceRepo;
    @Autowired private ClassSessionRepository sessionRepo;
    @Autowired private SubjectRepository subjectRepo;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ----- 1. Generates a Quiz based on Student's Attendance -----
    public String generateQuiz(String studentId, Long subjectId) throws Exception {

        // 1. Fetch the Subject and check if syllabus exists
        Subject subject = subjectRepo.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        if (subject.getSyllabusText() == null || subject.getSyllabusText().isEmpty()) {
            throw new RuntimeException("No syllabus uploaded for this subject yet. Please ask your teacher to upload one.");
        }

        // 2. Calculate Attendance & Difficulty Tier
        int attended = attendanceRepo.countByStudentIdAndSubjectId(studentId, subjectId);
        long total = sessionRepo.countValidSessionsBySubjectId(subjectId);
        double percentage = total == 0 ? 0 : ((double) attended / total) * 100;

        String difficulty;
        if (percentage < 50) difficulty = "Very Basic (Severe category)";
        else if (percentage < 75) difficulty = "Basic to Easy";
        else if (percentage < 90) difficulty = "Easy to Medium";
        else if (percentage < 95) difficulty = "Medium to Hard (Advanced)";
        else difficulty = "Hard to Slightly Hard (Pro)";

        // 3. Build Prompt for JSON Output using pre-saved syllabus
        String prompt = "You are an expert professor. Based on this syllabus content: '" + subject.getSyllabusText() + "'. " +
                "Generate a 3-question multiple-choice quiz. The difficulty MUST be strictly '" + difficulty + "'. " +
                "RETURN ONLY A VALID JSON ARRAY of objects. No markdown, no code blocks, just raw JSON. " +
                "Format exactly like this: [{\"question\": \"...\", \"options\": [\"A\", \"B\", \"C\", \"D\"], \"correctAnswer\": \"A\"}]";

        // 4. Call Gemini
        String fullUrl = geminiApiUrl + geminiApiKey;
        Map<String, Object> requestBody = Map.of("contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        String responseStr = restTemplate.postForObject(fullUrl, request, String.class);
        JsonNode rootNode = objectMapper.readTree(responseStr);
        String rawContent = rootNode.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();

        // 5. Cleans a raw text string returned from Gemini AI. It ensures the result is a clean string containing only the JSON data, preparing it for a JSON.parse() function.
        return rawContent.replace("```json", "").replace("```", "").trim();
    }
}