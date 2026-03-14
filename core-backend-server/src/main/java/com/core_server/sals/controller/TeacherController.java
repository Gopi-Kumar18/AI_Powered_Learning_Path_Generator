package com.core_server.sals.controller;


import com.core_server.sals.entity.Attendance;
import com.core_server.sals.repository.AttendanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.core_server.sals.entity.ClassSession;
import com.core_server.sals.repository.ClassSessionRepository;


import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;

@RestController
@RequestMapping("/api/teacher")
@CrossOrigin(origins = "*")
public class TeacherController {

    @Autowired private AttendanceRepository attendanceRepository;
    @Autowired private ClassSessionRepository classSessionRepository;

    // ----- 1. API To Fetch Students Attending a Live Running Session -----
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

    // ----- 2. Fetch All Past SESSIONS -----
    @GetMapping("/sessions/{teacherId}")
    public List<Map<String, Object>> getTeacherSessions(@PathVariable String teacherId) {
        List<ClassSession> sessions = classSessionRepository.findByTeacherIdOrderByCreatedAtDesc(teacherId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (ClassSession s : sessions) {
            long presentCount = attendanceRepository.countBySession_Id(s.getId());

            Map<String, Object> map = new HashMap<>();
            map.put("sessionId", s.getSessionIdentifier());
            map.put("subject", s.getSubject() != null ? s.getSubject().getName() : "Unknown");
            map.put("date", s.getCreatedAt().toLocalDate().toString());
            map.put("time", s.getCreatedAt().toLocalTime().toString().substring(0, 5));
            map.put("isMakeup", s.isMakeup());
            map.put("totalPresent", presentCount);

            result.add(map);
        }
        return result;
    }


    // ----- 3. Fetch TEACHER ANALYTICS DB Stats -----
    @GetMapping("/analytics/{teacherId}")
    public Map<String, Object> getTeacherAnalytics(@PathVariable String teacherId) {
        List<ClassSession> sessions = classSessionRepository.findByTeacherIdOrderByCreatedAtDesc(teacherId);

        int totalSessions = sessions.size();
        long totalPresentOverall = 0;

        Map<String, Integer> subjectSessionCount = new HashMap<>();
        Map<String, Long> subjectPresentCount = new HashMap<>();
        Map<String, Long> dailyTrend = new LinkedHashMap<>();

        for (ClassSession s : sessions) {
            String subject = s.getSubject() != null ? s.getSubject().getName() : "Unknown";
            String date = s.getCreatedAt().toLocalDate().toString();

            long presentCount = attendanceRepository.countBySession_Id(s.getId());
            totalPresentOverall += presentCount;

            subjectSessionCount.put(subject, subjectSessionCount.getOrDefault(subject, 0) + 1);
            subjectPresentCount.put(subject, subjectPresentCount.getOrDefault(subject, 0L) + presentCount);

            dailyTrend.put(date, dailyTrend.getOrDefault(date, 0L) + presentCount);
        }

        // 1. Format Subject Data for Bar Chart
        List<Map<String, Object>> subjectData = new ArrayList<>();
        for (String sub : subjectSessionCount.keySet()) {
            long totalPres = subjectPresentCount.get(sub);
            int sessCount = subjectSessionCount.get(sub);
            subjectData.add(Map.of(
                    "subject", sub,
                    "avgStudents", sessCount > 0 ? (totalPres / sessCount) : 0
            ));
        }

        // 2. Format Trend Data for Line Chart
        List<Map<String, Object>> trendData = new ArrayList<>();
        for (Map.Entry<String, Long> entry : dailyTrend.entrySet()) {
            trendData.add(Map.of("date", entry.getKey(), "attendance", entry.getValue()));
        }

        return Map.of(
                "totalSessions", totalSessions,
                "totalPresent", totalPresentOverall,
                "subjectData", subjectData,
                "trendData", trendData
        );
    }

    // ----- 4. MANAGE STUDENTS FEATURE-----
    @GetMapping("/students/{teacherId}")
    public List<Map<String, Object>> getTeacherStudents(@PathVariable String teacherId) {
        List<Object[]> stats = attendanceRepository.findStudentStatsForTeacher(teacherId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (Object[] row : stats) {
            Map<String, Object> map = new HashMap<>();
            map.put("studentId", row[0]);
            map.put("totalAttended", row[1]);

            if (row[2] != null) {
                java.time.LocalDateTime lastSeen = (java.time.LocalDateTime) row[2];
                map.put("lastSeenDate", lastSeen.toLocalDate().toString());
                map.put("lastSeenTime", lastSeen.toLocalTime().toString().substring(0, 5));
            } else {
                map.put("lastSeenDate", "Never");
                map.put("lastSeenTime", "");
            }

            result.add(map);
        }
        return result;
    }


    // ----- 5. EXPORT SESSION ATTENDANCE TO CSV -----
    @GetMapping(value = "/sessions/{sessionIdentifier}/export", produces = "text/csv")
    public ResponseEntity<String> exportSessionAttendance(@PathVariable String sessionIdentifier) {
        List<Attendance> logs = attendanceRepository.findBySession_SessionIdentifierOrderByTimestampDesc(sessionIdentifier);

        StringBuilder csvBuilder = new StringBuilder();
        csvBuilder.append("Student ID,Verification Status,Time Marked\n");

        for (Attendance a : logs) {
            String time = a.getTimestamp().toLocalTime().toString().substring(0, 5);
            csvBuilder.append(a.getStudentId()).append(",")
                    .append("Biometric Verified").append(",")
                    .append(time).append("\n");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=attendance_" + sessionIdentifier + ".csv");

        return new ResponseEntity<>(csvBuilder.toString(), headers, HttpStatus.OK);
    }
}