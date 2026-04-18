package com.core_server.sals.entity;


import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "subjects")
public class Subject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String subjectCode; //JAVA2026

    private String name; // e.g., "Data Structures"

    @Column(columnDefinition = "LONGTEXT")
    private String syllabusText;

}
