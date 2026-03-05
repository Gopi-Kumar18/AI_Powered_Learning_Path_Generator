package com.core_server.sals.controller;

import com.core_server.sals.dto.StudentDashboardDTO;
import com.core_server.sals.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "*") // Allow React to access this
public class StudentController {

    @Autowired
    private DashboardService dashboardService;

    // This is the route your Frontend is trying to hit:
    // GET http://localhost:8080/api/student/stats/{studentId}
    @GetMapping("/stats/{studentId}")
    public StudentDashboardDTO getStudentStats(@PathVariable String studentId) {
        return dashboardService.getStudentStats(studentId);
    }
}