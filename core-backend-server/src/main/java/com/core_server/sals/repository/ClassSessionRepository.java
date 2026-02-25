package com.core_server.sals.repository;


import com.core_server.sals.entity.ClassSession;
import org.springframework.data.jpa.repository.JpaRepository;


public interface ClassSessionRepository extends JpaRepository<ClassSession, Long> {
    ClassSession findBySessionIdentifier(String sessionIdentifier);
}