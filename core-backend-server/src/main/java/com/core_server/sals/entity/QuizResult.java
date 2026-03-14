package com.core_server.sals.entity;


import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "quiz_results")
public class QuizResult {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String studentId;
    private Long subjectId;
    private int score;
    private int totalQuestions = 20;
    private LocalDateTime takenAt = LocalDateTime.now();
}
