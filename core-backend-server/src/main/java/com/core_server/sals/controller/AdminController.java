package com.core_server.sals.controller;

import com.core_server.sals.model.User;
import com.core_server.sals.repository.ClassSessionRepository;
import com.core_server.sals.repository.SubjectRepository;
import com.core_server.sals.repository.UserRepository;
import com.core_server.sals.entity.Subject;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired private UserRepository userRepository;
    @Autowired private ClassSessionRepository sessionRepository;
    @Autowired private PasswordEncoder pe;
    @Autowired private SubjectRepository subjectRepository;

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
    @PostMapping(value = "/subject/{subjectId}/upload-syllabus")
    public Map<String, Object> uploadSyllabus(
            @PathVariable Long subjectId,
            @RequestParam("file") MultipartFile file) {

        Optional<Subject> subjectOpt = subjectRepository.findById(subjectId);
        if (subjectOpt.isEmpty()) {
            return Map.of("status", "ERROR", "message", "Subject not found");
        }

        try (InputStream is = file.getInputStream(); PDDocument document = PDDocument.load(is)) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);

            String cleanText = text.length() > 10000 ? text.substring(0, 10000) : text;

            // Save the raw text to the MySQL database
            Subject subject = subjectOpt.get();
            subject.setSyllabusText(cleanText);
            subjectRepository.save(subject);

            return Map.of("status", "SUCCESS", "message", "Syllabus breaked down and saved to database!");
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("status", "ERROR", "message", "Failed to parse PDF.");
        }
    }
}


