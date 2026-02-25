package com.core_server.sals.repository;


import com.core_server.sals.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    // We can add custom queries later like:
    // List<Attendance> findByStudentId(String studentId);
}
