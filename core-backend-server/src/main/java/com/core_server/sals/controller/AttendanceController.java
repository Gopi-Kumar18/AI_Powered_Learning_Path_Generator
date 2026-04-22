package com.core_server.sals.controller;

import com.core_server.sals.dto.StudentDashboardDTO;
import com.core_server.sals.entity.Attendance;
import com.core_server.sals.entity.ClassSession;
import com.core_server.sals.entity.Subject;
import com.core_server.sals.repository.AttendanceRepository;
import com.core_server.sals.repository.ClassSessionRepository;
import com.core_server.sals.repository.SubjectRepository;
import com.core_server.sals.repository.UserRepository;
import com.core_server.sals.model.User;
import com.core_server.sals.service.FaceVerificationService;
import com.core_server.sals.service.GeofencingService;
import com.core_server.sals.service.QRCodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired private QRCodeService qrCodeService;
    @Autowired private ClassSessionRepository sessionRepository;
    @Autowired private AttendanceRepository attendanceRepository;
    @Autowired private SubjectRepository subjectRepository;
    @Autowired private GeofencingService geofencingService;
    @Autowired private FaceVerificationService faceService;
    @Autowired private UserRepository userRepository;

    // ----- 1. Timetable -----
    private static final Map<DayOfWeek, List<String>> TIMETABLE = Map.of(
            DayOfWeek.MONDAY, List.of("OS2026", "CN2026", "JAVA2026", "OSLAB2026"),
            DayOfWeek.TUESDAY, List.of("OS2026", "CN2026", "JAVA2026", "DBMS2026", "DSA2026"),
            DayOfWeek.WEDNESDAY, List.of("OS2026", "CN2026", "JAVA2026"),
            DayOfWeek.THURSDAY, List.of("JAVA2026", "DSA2026", "DSA2026"),
            DayOfWeek.FRIDAY, List.of("PEL2026", "PEL2026", "CNLAB2026"),

            // --- TEMPORARY WEEKEND TESTING ---
            DayOfWeek.SATURDAY, List.of("JAVA2026", "DSA2026", "DBMS2026", "OS2026", "PEL2026", "CN2026", "OSLAB2026"),
            DayOfWeek.SUNDAY, List.of("JAVA2026", "DSA2026", "DBMS2026", "OS2026", "PEL2026", "CN2026", "OSLAB2026")
    );

    // ----- 2. Attendance Session Creation -----
    @PostMapping("/create-session")
    public Map<String, String> createSession(@RequestBody Map<String, String> sessionData) {
        String subjectCode = sessionData.get("subjectCode");
        String batch = sessionData.get("batch");
        String teacherId = sessionData.get("teacherId");

        Optional<Subject> subjectOpt = subjectRepository.findBySubjectCode(subjectCode);

        if (subjectOpt.isEmpty()) {
            return Map.of(
                    "status", "FAIL",
                    "message", "Invalid Subject Code. Please contact the Administrator to register this subject."
            );
        }

        Subject subjectEntity = subjectOpt.get();
        String subjectName = subjectEntity.getName();

    ClassSession session = new ClassSession();
    session.setSubject(subjectEntity);
    session.setBatch(batch);
    session.setTeacherId(teacherId != null ? teacherId : "UNKNOWN_TEACHER");
    session.setStartTime(LocalDateTime.now());
    session.setCreatedAt(LocalDateTime.now());
    session.setActive(true);

    DayOfWeek today = LocalDateTime.now().getDayOfWeek();
    List<String> validSubjectsToday = TIMETABLE.getOrDefault(today, List.of());
    long scheduledCount = validSubjectsToday.stream()
                .filter(s -> s.equalsIgnoreCase(subjectEntity.getSubjectCode()))
                .count();

    if (scheduledCount == 0) {
        // SCENARIO 1: Invalid/Unknown Class (e.g., DBMS on Thursday)
        session.setIsValidSchedule(false);
        session.setMakeup(false);
    } else {
        // SCENARIO 2: Valid Scheduled Class (Normal or Makeup)
        session.setIsValidSchedule(true);
        LocalDateTime startOfDay = LocalDateTime.now().with(LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.now().with(LocalTime.MAX);

        long alreadyCreatedCount = sessionRepository.countTodayValidSessions(subjectEntity.getId(), startOfDay, endOfDay);

        if (alreadyCreatedCount >= scheduledCount) {
            session.setMakeup(true); // Trigger Makeup Class
        } else {
            session.setMakeup(false); // Normal Class
        }
    }

    String uniqueId = subjectEntity.getSubjectCode() + "-" + System.currentTimeMillis();
    session.setSessionIdentifier(uniqueId);
    sessionRepository.save(session);

    return Map.of("status", "SUCCESS","sessionId", uniqueId, "isMakeup", String.valueOf(session.isMakeup()),"message", "Session created successfully for " + subjectName);
}

    // ----- 2. GENERATE QR(token) for every 10sec -----
    @GetMapping("/generate-qr")
    public Map<String, String> getDynamicQr(@RequestParam String sessionId) {
        String token = qrCodeService.generateDynamicQrToken(sessionId);
        return Map.of("qrToken", token, "expiresIn", "10s");
    }

    // ----- 3. MARK ATTENDANCE ------
    @PostMapping(value = "/mark", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Object> markAttendance(
            @RequestParam("qrToken") String token,
            @RequestParam("studentId") String studentId,
            @RequestParam("lat") double lat,
            @RequestParam("lng") double lng,
            @RequestParam("file") MultipartFile file
    ) {
        // A. Validate Token
        if (!qrCodeService.validateToken(token)) { return Map.of("status", "ERROR", "message", "QR code has been Expired"); }

        // B. Extract Session ID (Using the new method in QRCodeService)
        String sessionId = qrCodeService.extractSessionId(token);
        if (sessionId == null) { return Map.of("status", "ERROR", "message", "Invalid Token Data"); }

        ClassSession session = sessionRepository.findBySessionIdentifier(sessionId);
        if (session == null) { return Map.of("status", "ERROR", "message", "Class Session Not Found"); }

        if (attendanceRepository.existsByStudentIdAndSession(studentId, session)) { return Map.of("status", "SUCCESS", "message", "Attendance Already Marked!"); }

        DayOfWeek today = LocalDateTime.now().getDayOfWeek();
        List<String> validSubjectsToday = TIMETABLE.getOrDefault(today, List.of());

        boolean isScheduledToday = validSubjectsToday.stream().anyMatch(s -> s.equalsIgnoreCase(session.getSubject().getSubjectCode()));

        // C. No Class present on a specific day
        if (!isScheduledToday && !session.isMakeup()) { return Map.of("status", "REJECTED", "message", "No such class named on this specific day"); }

        // D. Validate Location
        if (!geofencingService.isWithinRange(lat, lng)) { return Map.of("status", "REJECTED", "message", "Too far from class!"); }

        // E. Validate Face
        if (!faceService.verifyStudentFace(studentId, file)) { return Map.of("status", "REJECTED", "message", "Face Verification Failed!"); }

        // F. Save Record
        Attendance record = new Attendance();
        record.setStudentId(studentId);
        record.setSession(session);
        record.setTimestamp(LocalDateTime.now());
        record.setLatitude(lat);
        record.setLongitude(lng);
        record.setStatus(Attendance.AttendanceStatus.PRESENT);
        attendanceRepository.save(record);

        return Map.of("status", "SUCCESS", "message", session.isMakeup() ? "Marked Present! (Makeup Class)" : "Marked Present!");
    }

    // ----- 4. NEW: Fetch Real Session Info from a QR Token -----
    @GetMapping("/session-info")
    public Map<String, Object> getSessionInfoFromToken(@RequestParam String token) {
        if (!qrCodeService.validateToken(token)) {
            return Map.of("status", "ERROR", "message", "QR code has Expired");
        }

        String sessionId = qrCodeService.extractSessionId(token);
        ClassSession session = sessionRepository.findBySessionIdentifier(sessionId);
        if (session == null) return Map.of("status", "ERROR", "message", "Session not found");

        String teacherName = "Unknown Professor";
        Optional<User> teacherOpt = userRepository.findByCustomId(session.getTeacherId());
        if (teacherOpt.isPresent()) {
            teacherName = teacherOpt.get().getName();
        }

        return Map.of(
                "status", "SUCCESS",
                "subjectName", session.getSubject().getName(),
                "subjectCode", session.getSubject().getSubjectCode(),
                "teacherName", teacherName,
                "batch", session.getBatch(),
                "time", session.getCreatedAt().toLocalTime().toString().substring(0, 5),
                "date", session.getCreatedAt().toLocalDate().toString()
        );
    }

}



