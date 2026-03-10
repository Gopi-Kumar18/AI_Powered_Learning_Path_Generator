

package com.core_server.sals.repository;

import com.core_server.sals.entity.ClassSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface ClassSessionRepository extends JpaRepository<ClassSession, Long> {

    ClassSession findBySessionIdentifier(String sessionIdentifier);

    // 1. Count sessions this week
    // We pass the start and end date of the current week from the Service
    @Query("SELECT COUNT(s) FROM ClassSession s WHERE s.createdAt BETWEEN :startDate AND :endDate")
    int countSessionsBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // For Dashboard: Only count valid scheduled classes in the Total denominator
    @Query("SELECT COUNT(s) FROM ClassSession s WHERE s.subject.id = :subjectId AND s.isValidSchedule = true")
    long countValidSessionsBySubjectId(@Param("subjectId") Long subjectId);

    // For Controller: Count how many legitimate classes happened today for Makeup logic
    @Query("SELECT COUNT(s) FROM ClassSession s WHERE s.subject.id = :subjectId AND s.isValidSchedule = true AND s.createdAt BETWEEN :start AND :end")
    long countTodayValidSessions(@Param("subjectId") Long subjectId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // Fetch all sessions created by a specific teacher, ordered from newest to oldest.
    List<ClassSession> findByTeacherIdOrderByCreatedAtDesc(String teacherId);
}