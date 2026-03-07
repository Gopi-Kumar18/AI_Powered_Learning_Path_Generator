package com.core_server.sals.controller;


import com.core_server.sals.entity.Attendance;
import com.core_server.sals.repository.AttendanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teacher")
//@CrossOrigin(origins = "*")
public class TeacherController {

    @Autowired
    private AttendanceRepository attendanceRepository;

    // API to get live attendance for a running session
    @GetMapping("/session-logs/{sessionIdentifier}")
    public Map<String, Object> getLiveSessionLogs(@PathVariable String sessionIdentifier) {
        List<Attendance> logs = attendanceRepository.findBySession_SessionIdentifierOrderByTimestampDesc(sessionIdentifier);

        List<Map<String, String>> formattedLogs = new ArrayList<>();
        for (Attendance a : logs) {
            Map<String, String> log = new HashMap<>();
            log.put("studentId", a.getStudentId());
            log.put("time", a.getTimestamp().toLocalTime().toString().substring(0, 5));
            log.put("status", a.getStatus().name());
            formattedLogs.add(log);
        }

        return Map.of(
                "totalPresent", logs.size(),
                "logs", formattedLogs
        );
    }
}