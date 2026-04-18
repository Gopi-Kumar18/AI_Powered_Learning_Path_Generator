package com.core_server.sals.controller;

import com.core_server.sals.model.User;
import com.core_server.sals.repository.ClassSessionRepository;
import com.core_server.sals.repository.SubjectRepository;
import com.core_server.sals.repository.UserRepository;
import com.core_server.sals.entity.Subject;
import com.core_server.sals.service.EmailAlertService;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Map;
import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired private UserRepository userRepository;
    @Autowired private ClassSessionRepository sessionRepository;
    @Autowired private PasswordEncoder pe;
    @Autowired private SubjectRepository subjectRepository;
    @Autowired private EmailAlertService emailAlertService;

    // ----- 1. Get Admin DB(Dashboard) stats -----
    @GetMapping("/stats")
    public Map<String, Object> getSystemStats() {
        long totalStudents = userRepository.findAll().stream().filter(u -> "STUDENT".equalsIgnoreCase(u.getRole())).count();
        long totalTeachers = userRepository.findAll().stream().filter(u -> "TEACHER".equalsIgnoreCase(u.getRole())).count();
        long totalSessions = sessionRepository.count();

        return Map.of(
                "totalStudents", totalStudents,
                "totalTeachers", totalTeachers,
                "totalSessions", totalSessions
        );
    }

    // ----- 2. Register New Users (Students/Teachers/Admin) -----
    @PostMapping("/register")
    public Map<String, String> registerUser(@RequestBody User newUser) {
        if (userRepository.findByCustomId(newUser.getCustomId()).isPresent()) {
            return Map.of("status", "ERROR", "message", "User ID already exists!");
        }
        newUser.setPassword(pe.encode(newUser.getPassword()));
        userRepository.save(newUser);

        return Map.of("status", "SUCCESS", "message", newUser.getRole() + " registered successfully!");
    }

    // ----- 3. Upload Subjects Syllabus in DB -----
    @PostMapping(value = "/subject/{subjectCode}/upload-syllabus")
    public Map<String, Object> uploadSyllabus(
            @PathVariable String subjectCode,
            @RequestParam("file") MultipartFile file) {

        Optional<Subject> subjectOpt = subjectRepository.findBySubjectCode(subjectCode);

        if (subjectOpt.isEmpty()) {
            return Map.of("status", "ERROR", "message", "Subject not found for code: " + subjectCode);
        }

        try (InputStream is = file.getInputStream(); PDDocument document = PDDocument.load(is)) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);

            String cleanText = text.length() > 10000 ? text.substring(0, 10000) : text;

            Subject subject = subjectOpt.get();
            subject.setSyllabusText(cleanText);
            subjectRepository.save(subject);

            return Map.of("status", "SUCCESS", "message", "Syllabus broken down and saved to database!");
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("status", "ERROR", "message", "Failed to parse PDF.");
        }
    }

    // ------ 4. Triggers audit of an student ------
    @PostMapping("/trigger-audit")
    public ResponseEntity<?> triggerSystemAudit() {
        try {
            int emailsDispatched = emailAlertService.runSystemWideAudit();

            return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "message", "System audit complete.",
                    "emailsSent", emailsDispatched
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "status", "ERROR",
                    "message", "Failed to run audit: " + e.getMessage()
            ));
        }
    }

    // ----- 5. Create a New Subject (ADMIN ONLY) -----
    @PostMapping("/subject/create")
    public Map<String, String> createSubject(@RequestBody Map<String, String> payload) {
        String subjectCode = payload.get("subjectCode");
        String name = payload.get("name");

        if (subjectCode == null || name == null || subjectCode.trim().isEmpty() || name.trim().isEmpty()) {
            return Map.of("status", "ERROR", "message", "Subject Code and Name are required.");
        }

        String cleanCode = subjectCode.replaceAll("\\s+", "").toUpperCase();

        if (subjectRepository.findBySubjectCode(cleanCode).isPresent()) {
            return Map.of("status", "ERROR", "message", "Subject Code '" + cleanCode + "' already exists!");
        }

        Subject newSubject = new Subject();
        newSubject.setSubjectCode(cleanCode);
        newSubject.setName(name);

        subjectRepository.save(newSubject);

        return Map.of(
                "status", "SUCCESS",
                "message", "Subject '" + name + "' created successfully with code: " + cleanCode
        );
    }

    // ----- 6. Get All Subjects  -----
    @GetMapping("/subjects")
    public List<Map<String, String>> getAllSubjects() {
        return subjectRepository.findAll().stream()
                .map(sub -> Map.of(
                        "code", sub.getSubjectCode(),
                        "name", sub.getName()
                ))
                .collect(Collectors.toList());
    }
}


