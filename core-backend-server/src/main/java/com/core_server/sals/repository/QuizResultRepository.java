package com.core_server.sals.repository;


import com.core_server.sals.entity.QuizResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizResultRepository extends JpaRepository<QuizResult, Long> {

    // This query searches for all quizzes a student took for a subject, sorts them by date, and only returns the single most recent one.
    QuizResult findTopByStudentIdAndSubjectCodeOrderByTakenAtDesc(String studentId, String subjectCode);

    // Fetch all quiz results for a specific subject to build the Marks Graph
    List<QuizResult> findBySubjectCode(String subjectCode);
}
