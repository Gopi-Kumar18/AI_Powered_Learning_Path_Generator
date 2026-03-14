

package com.core_server.sals.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "attendance_records", uniqueConstraints = { @UniqueConstraint(columnNames = {"student_id", "session_id" })}) // Ensures Idempotent Attendance
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String studentId;


    @ManyToOne
    @JoinColumn(name = "session_id")
    private ClassSession session;

    private LocalDateTime timestamp;

    private double latitude;
    private double longitude;

    @Enumerated(EnumType.STRING)
    private AttendanceStatus status;

    public enum AttendanceStatus {
        PRESENT,
        REJECTED_DISTANCE,
        REJECTED_TIMEOUT,
        REJECTED_PROXY
    }
}