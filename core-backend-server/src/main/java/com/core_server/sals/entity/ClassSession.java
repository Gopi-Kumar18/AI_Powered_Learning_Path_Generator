
package com.core_server.sals.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "class_sessions")
public class ClassSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String sessionIdentifier; // e.g., "CS101-1708..."

    // --- Relationship ---
    @ManyToOne
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @Column(name = "is_makeup")
    private boolean isMakeup;

    @Column(name = "is_valid_schedule")
    private Boolean isValidSchedule = true;

    private String teacherId;

    private LocalDateTime startTime;

    private boolean active;

    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;

    private double latitude;
    private double longitude;
    private double radius;
}