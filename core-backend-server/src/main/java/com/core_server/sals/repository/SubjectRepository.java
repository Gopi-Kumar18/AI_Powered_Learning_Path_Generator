package com.core_server.sals.repository;


import com.core_server.sals.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {

    // A standard lookup method to find a subject's database record (and its ID) when we only have its text name (like from a frontend dropdown).
    Subject findByName(String name);
}