package com.core_server.sals.controller;


import com.core_server.sals.entity.ClassSession;
import com.core_server.sals.repository.AttendanceRepository;
import com.core_server.sals.repository.ClassSessionRepository;
import com.core_server.sals.service.GeofencingService;
import com.core_server.sals.service.QRCodeService;
import com.core_server.sals.service.FaceVerificationService;
import com.core_server.sals.entity.Attendance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;


@RestController
@RequestMapping("/api/attendance")

public class AttendanceController {

    @Autowired private QRCodeService qrCodeService;
    @Autowired private ClassSessionRepository sessionRepository;

    @Autowired private AttendanceRepository attendanceRepository;
    @Autowired private GeofencingService geofencingService;

    @Autowired private FaceVerificationService faceService;



    @PostMapping("/create-session")
    public Map<String, String> createSession(@RequestBody Map<String, String> sessionData) {

        // 1. Extract Data
        String subject = sessionData.get("subject");
        String batch = sessionData.get("batch");

        // 2. Create Entity
        ClassSession session = new ClassSession();
        session.setSubjectName(subject);
        session.setTeacherId("TEACHER-001"); // Hardcoded for now until Auth is ready
        session.setStartTime(java.time.LocalDateTime.now());
        session.setActive(true);

        // 3. Generate a Unique Session ID (e.g., CS101-170845...)
        String uniqueId = subject.replaceAll("\\s+", "").toUpperCase() + "-" + System.currentTimeMillis();
        session.setSessionIdentifier(uniqueId);

        sessionRepository.save(session);

        // 4. Return the ID to Frontend
        return Map.of("sessionId", uniqueId);
    }

    // API: GET /api/attendance/generate-qr?sessionId=CS101-170845...
    @GetMapping("/generate-qr")
    public Map<String, String> getDynamicQr(@RequestParam String sessionId) {

        String token = qrCodeService.generateDynamicQrToken(sessionId);

        return Map.of("qrToken", token, "expiresIn", "10s");
    }


    /**
     * FEATURE 3: MARK ATTENDANCE (WITH FACE + LOCATION + QR)
     * Input: Multipart Form Data (Not JSON)
     */
    @PostMapping(value = "/mark", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Object> markAttendance(
            @RequestParam("qrToken") String token,
            @RequestParam("studentId") String studentId,
            @RequestParam("lat") double lat,
            @RequestParam("lng") double lng,
            @RequestParam("file") MultipartFile file
    ) {
        // 1. Validate Token (Time Lock)
        boolean isValidToken = qrCodeService.validateToken(token);
        if (!isValidToken) {
            return Map.of("status", "ERROR", "message", "QR Code Expired");
        }

        // 2. Validate Location (Location Lock)
        // Note: Reset ALLOWED_RADIUS_METERS to 50.0 in GeofencingService after testing!
        boolean isNear = geofencingService.isWithinRange(lat, lng);
        if (!isNear) {
            return Map.of("status", "REJECTED", "message", "Too far from class!");
        }

        // 3. Validate Face (Face Lock) - NEW!
        boolean isFaceValid = faceService.verifyStudentFace(studentId, file);
        if (!isFaceValid) {
            return Map.of("status", "REJECTED", "message", "Face Verification Failed!");
        }

        // 4. Save Record (Success)
        Attendance record = new Attendance();
        record.setStudentId(studentId);
        record.setTimestamp(java.time.LocalDateTime.now());
        record.setLatitude(lat);
        record.setLongitude(lng);
        record.setStatus(Attendance.AttendanceStatus.PRESENT);

        attendanceRepository.save(record);

        return Map.of("status", "SUCCESS", "message", "Marked Present! (Face Verified)");
    }


//    /**
//     * FEATURE 2: MARK ATTENDANCE WITH GEOLOCATION
//     * Input: { "qrToken": "...", "studentId": "...", "lat": 16.2, "lng": 80.6 }
//     */
//    @PostMapping("/mark")
//    public Map<String, Object> markAttendance(@RequestBody Map<String, Object> payload) {
//        String token = (String) payload.get("qrToken");
//        String studentId = (String) payload.get("studentId");
//        double lat = Double.parseDouble(payload.get("lat").toString());
//        double lng = Double.parseDouble(payload.get("lng").toString());
//
//        // 1. Validate Token (Is it expired?)
//        boolean isValidToken = qrCodeService.validateToken(token);
//        if (!isValidToken) {
//            return Map.of("status", "ERROR", "message", "QR Code Expired or Invalid");
//        }
//
//        // 2. Validate Location (Geofencing)
//        boolean isNear = geofencingService.isWithinRange(lat, lng);
////        boolean isNear = true;
//
//        // 3. Save Record
//        Attendance record = new Attendance();
//        record.setStudentId(studentId);
//        record.setTimestamp(java.time.LocalDateTime.now());
//        record.setLatitude(lat);
//        record.setLongitude(lng);
//
//        if (isNear) {
//            record.setStatus(Attendance.AttendanceStatus.PRESENT);
//            attendanceRepository.save(record);
//            return Map.of("status", "SUCCESS", "message", "Marked Present!");
//        } else {
//            record.setStatus(Attendance.AttendanceStatus.REJECTED_DISTANCE);
//            attendanceRepository.save(record);
//            return Map.of("status", "REJECTED", "message", "You are too far from class!");
//        }
//    }

}