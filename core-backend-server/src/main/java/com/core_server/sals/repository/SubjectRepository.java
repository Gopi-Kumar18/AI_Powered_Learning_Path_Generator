package com.core_server.sals.repository;


import com.core_server.sals.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, String> {

    //    Subject findByName(String name);

    Optional<Subject> findBySubjectCode(String subjectCode);
}