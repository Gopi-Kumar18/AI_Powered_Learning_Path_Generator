package com.core_server.sals.controller;


import com.core_server.sals.model.User;
import com.core_server.sals.repository.UserRepository;
import com.core_server.sals.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Allow React to talk
public class AuthController {

    @Autowired private UserRepository userRepository;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private PasswordEncoder passwordEncoder;

    // 1. REGISTER (One-time setup helper)
//    @PostMapping("/register")
//    public String register(@RequestBody User user) {
//        userRepository.save(user);
//        return "User Registered: " + user.getName();
//    }

    // 1. REGISTER (One-time setup helper)
    @PostMapping("/register")
    public Map<String, String> register(@RequestBody User user) {
        // Hash the password before saving to MySQL
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);

        return Map.of("status", "SUCCESS", "message", "User Registered: " + user.getName());
    }

    // 2. LOGIN
    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> payload) {
        String inId = payload.get("userId");
        String inPassword = payload.get("password");

        Optional<User> userOpt = userRepository.findByCustomId(inId);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // In real app, use BCryptPasswordEncoder here!
            if (passwordEncoder.matches(inPassword, user.getPassword())) {
                String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getCustomId());
                return Map.of(
                        "status", "SUCCESS",
                        "token", token,
                        "role", user.getRole(),
                        "userId", user.getCustomId(),
                        "name", user.getName()
                );
            }
        }
        return Map.of("status", "FAIL", "message", "Invalid Credentials");
    }
}