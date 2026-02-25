package com.core_server.sals.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "attendance_records")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String studentId;
    private String sessionId;

    private LocalDateTime timestamp;

    private double latitude;
    private double longitude;

    @Enumerated(EnumType.STRING)
    private AttendanceStatus status; // PRESENT, REJECTED_FAR, REJECTED_PROXY

    public enum AttendanceStatus {
        PRESENT,
        REJECTED_DISTANCE,
        REJECTED_TIMEOUT
    }
}