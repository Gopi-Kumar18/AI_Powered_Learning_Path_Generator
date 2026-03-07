

package com.core_server.sals.repository;

import com.core_server.sals.entity.Attendance;
import com.core_server.sals.entity.ClassSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.time.LocalDateTime;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    @Query("SELECT COUNT(DISTINCT a.session.id) FROM Attendance a WHERE a.studentId = :studentId AND a.session.subject.id = :subjectId AND a.status = 'PRESENT'")
    int countByStudentIdAndSubjectId(@Param("studentId") String studentId, @Param("subjectId") Long subjectId);

    List<Attendance> findByStudentIdAndTimestampBetweenOrderByTimestampDesc(String studentId, LocalDateTime startOfDay, LocalDateTime endOfDay);

    boolean existsByStudentIdAndSession(String studentId, ClassSession session);

    // Fetch all attendance logs for a specific live session
    List<Attendance> findBySession_SessionIdentifierOrderByTimestampDesc(String sessionIdentifier);
}