package com.core_server.sals.controller;


import com.core_server.sals.entity.Attendance;
import com.core_server.sals.entity.QuizResult;
import com.core_server.sals.model.User;
import com.core_server.sals.repository.AttendanceRepository;
import com.core_server.sals.repository.QuizResultRepository;
import com.core_server.sals.repository.UserRepository;
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
import java.util.Optional;

@RestController
@RequestMapping("/api/teacher")
public class TeacherController {

    @Autowired private AttendanceRepository attendanceRepository;
    @Autowired private ClassSessionRepository classSessionRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private QuizResultRepository quizResultRepository;

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
        // 1. Identify the Teacher and their assigned Subject
        Optional<User> teacherOpt = userRepository.findByCustomId(teacherId);
        if (teacherOpt.isEmpty()) return Map.of("error", "Teacher not found");

        String subjectCode = teacherOpt.get().getSubjectCode();
        String subjectName = "Your Subject";

        List<ClassSession> sessions = classSessionRepository.findByTeacherIdOrderByCreatedAtDesc(teacherId);

        if (!sessions.isEmpty() && sessions.get(0).getSubject() != null) {
            subjectName = sessions.get(0).getSubject().getName();
            subjectCode = sessions.get(0).getSubject().getSubjectCode();
        }

        int totalSessions = sessions.size();
        long totalPresentOverall = 0;

        Map<String, Long> dailyTrend = new LinkedHashMap<>();
        Map<String, Long> weeklyTrend = new LinkedHashMap<>();
        Map<String, Long> monthlyTrend = new LinkedHashMap<>();

        String[] daysOfWeek = {"MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"};
        for (String day : daysOfWeek) weeklyTrend.put(day, 0L);

        // 2. Aggregate Attendance Data
        for (ClassSession s : sessions) {
            long presentCount = attendanceRepository.countBySession_Id(s.getId());
            totalPresentOverall += presentCount;

            String date = s.getCreatedAt().toLocalDate().toString();
            String dayOfWeek = s.getCreatedAt().getDayOfWeek().name();
            String month = s.getCreatedAt().getMonth().name();

            dailyTrend.put(date, dailyTrend.getOrDefault(date, 0L) + presentCount);
            weeklyTrend.put(dayOfWeek, weeklyTrend.get(dayOfWeek) + presentCount);
            monthlyTrend.put(month, monthlyTrend.getOrDefault(month, 0L) + presentCount);
        }

        List<Map<String, Object>> dailyData = new ArrayList<>();
        dailyTrend.forEach((k, v) -> dailyData.add(Map.of("label", k, "attendance", v)));

        List<Map<String, Object>> weeklyData = new ArrayList<>();
        weeklyTrend.forEach((k, v) -> weeklyData.add(Map.of("label", k.substring(0, 3), "attendance", v))); // "MON", "TUE"

        List<Map<String, Object>> monthlyData = new ArrayList<>();
        monthlyTrend.forEach((k, v) -> monthlyData.add(Map.of("label", k.substring(0, 3), "attendance", v))); // "JAN", "FEB"

        // 3. Calculate AI Assessment Marks (Pass > 1 / Fail <= 1 out of 3)
        long passedCount = 0;
        long failedCount = 0;

        if (subjectCode != null) {
            List<QuizResult> quizzes = quizResultRepository.findBySubjectCode(subjectCode);
            passedCount = quizzes.stream().filter(q -> q.getScore() > 1).count();
            failedCount = quizzes.stream().filter(q -> q.getScore() <= 1).count();
        }

        return Map.of(
                "subjectName", subjectName,
                "totalSessions", totalSessions,
                "totalPresent", totalPresentOverall,
                "attendance", Map.of(
                        "daily", dailyData,
                        "weekly", weeklyData,
                        "monthly", monthlyData
                ),
                "marks", Map.of(
                        "passed", passedCount,
                        "failed", failedCount
                )
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