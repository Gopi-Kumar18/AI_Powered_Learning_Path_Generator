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

    private String name; // e.g., "Data Structures"
    private String code; // e.g., "CS301"

    @Column(columnDefinition = "LONGTEXT")
    private String syllabusText;
}
