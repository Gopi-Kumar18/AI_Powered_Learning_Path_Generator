package com.core_server.sals.config;


import com.core_server.sals.model.User;
import com.core_server.sals.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder pe;

    public DataSeeder(UserRepository userRepository, PasswordEncoder pe) {
        this.userRepository = userRepository;
        this.pe = pe;
    }

    @Override
    public void run(String... args) {
        // 1. Create Teacher if not exists
        if (userRepository.findByCustomId("29781").isEmpty()) {
            User teacher = new User(
                    null,                   // ID (Auto)
                    "29781",                  // Custom ID
                    "dr.smitch@sals.com",     // Email
                    pe.encode("pass123"), // Password
                    "TEACHER",              // Role
                    "Dr. Smith"             // Name
            );
            userRepository.save(teacher);
            System.out.println("✅ [SEEDER] Teacher Created: teacher@sals.com / pass123");
        }

        // 2. Create Student if not exists
        if (userRepository.findByCustomId("12321662").isEmpty()) {
            User student = new User(
                    null,                   // ID (Auto)
                    "12321662",              // Custom ID (Must match your 'known_faces' file!)
                    "student@sals.com",     // Email
                    pe.encode("pass123"), // Password
                    "STUDENT",              // Role
                    "Gopi Kumar"            // Name
            );
            userRepository.save(student);
            System.out.println("✅ [SEEDER] Student Created: student@sals.com / pass123");
        }
    }
}
