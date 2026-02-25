package com.core_server.sals.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * DESCRIPTION:
 * This entity represents a live class session.
 * It links a specific Subject (e.g., "Data Structures") to a Teacher
 * and generates a unique 'sessionCode' for that specific hour.
 */

@Entity
@Data
@Table(name = "class_sessions")
public class ClassSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String subjectName;
    private String teacherId; // Keeping it simple as String for now

    // The unique code for this specific class hour (e.g., "CS101-170845...")
    // This helps group all attendance records for this specific lecture.
    @Column(unique = true)
    private String sessionIdentifier;

    private LocalDateTime startTime;
    private boolean isActive;
}