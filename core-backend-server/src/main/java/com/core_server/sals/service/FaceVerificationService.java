package com.core_server.sals.service;



import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class FaceVerificationService {

    // The URL of your AI-backend-server
    private final String AI_SERVER_URL = "http://localhost:8000/verify-face";
    private final RestTemplate restTemplate = new RestTemplate();

    public boolean verifyStudentFace(String studentId, MultipartFile selfieFile) {
        try {
            // 1. Prepare the Headers (We are sending a File)
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            // 2. Prepare the Body (Student ID + The Image File)
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("student_id", studentId);
            body.add("file", new ByteArrayResource(selfieFile.getBytes()) {
                @Override
                public String getFilename() {
                    return selfieFile.getOriginalFilename();
                }
            });

            // 3. Wrap it in a Request
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // 4. Send POST Request to Python
            ResponseEntity<Map> response = restTemplate.postForEntity(AI_SERVER_URL, requestEntity, Map.class);

            // 5. Check Result
            Map<String, Object> result = response.getBody();
            if (result != null && "success".equals(result.get("status"))) {
                System.out.println("✅ AI VERIFIED: " + result.get("message") + " (Accuracy: " + result.get("accuracy") + "%)");
                return true;
            } else {
                System.out.println("❌ AI REJECTED: " + (result != null ? result.get("message") : "Unknown Error"));
                return false;
            }

        } catch (IOException e) {
            System.err.println("⚠️ Error reading file: " + e.getMessage());
            return false;
        } catch (Exception e) {
            System.err.println("⚠️ AI Server Error: " + e.getMessage());
            return false;
        }
    }
}