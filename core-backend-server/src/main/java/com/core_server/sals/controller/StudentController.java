package com.core_server.sals.controller;

import com.core_server.sals.dto.StudentDashboardDTO;
import com.core_server.sals.repository.UserRepository;
import com.core_server.sals.service.DashboardService;
import com.core_server.sals.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired private DashboardService dashboardService;
    @Autowired private UserRepository userRepository;


    @GetMapping("/stats/{studentId}")
    public StudentDashboardDTO getStudentStats(@PathVariable String studentId) {
        return dashboardService.getStudentStats(studentId);
    }


    // --- NEW FEATURE 8: GET STUDENT PROFILE ---
    @GetMapping("/profile/{studentId}")
    public Map<String, Object> getStudentProfile(@PathVariable String studentId) {
        Optional<User> userOpt = userRepository.findByCustomId(studentId);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return Map.of(
                    "status", "SUCCESS",
                    "studentId", user.getCustomId(),
                    "name", user.getName(),
                    "email", user.getEmail(),
                    "role", user.getRole(),
                    "biometricStatus", "Verified", // Assuming verified if they can log in/scan
                    "joinDate", "August 2024" // Placeholder for batch/join date
            );
        }

        return Map.of("status", "ERROR", "message", "User not found");
    }
}