package com.core_server.sals.controller;

import com.core_server.sals.model.User;
import com.core_server.sals.repository.ClassSessionRepository;
import com.core_server.sals.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired private UserRepository userRepository;
    @Autowired private ClassSessionRepository sessionRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    // 1. Get System-wide Stats
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

    // 2. Register New Users (Students/Teachers)
    @PostMapping("/register")
    public Map<String, String> registerUser(@RequestBody User newUser) {
        if (userRepository.findByCustomId(newUser.getCustomId()).isPresent()) {
            return Map.of("status", "ERROR", "message", "User ID already exists!");
        }

        // Securely hash the password before saving
        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));
        userRepository.save(newUser);

        return Map.of("status", "SUCCESS", "message", newUser.getRole() + " registered successfully!");
    }
}
