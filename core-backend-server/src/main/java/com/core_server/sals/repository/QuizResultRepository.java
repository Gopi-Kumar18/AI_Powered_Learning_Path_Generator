package com.core_server.sals.repository;


import com.core_server.sals.entity.QuizResult;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizResultRepository extends JpaRepository<QuizResult, Long> {

    // The keyword Top combined with OrderByTakenAtDesc is a Spring Data trick. It searches for all quizzes a student took for a subject, sorts them by date, and only returns the single most recent one.
    // This is exactly what the AI feature needs to generate the final roadmap.
    QuizResult findTopByStudentIdAndSubjectIdOrderByTakenAtDesc(String studentId, Long subjectId);
}
