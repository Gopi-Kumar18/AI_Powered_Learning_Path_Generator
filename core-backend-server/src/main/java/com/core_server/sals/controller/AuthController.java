package com.core_server.sals.controller;


import com.core_server.sals.model.User;
import com.core_server.sals.repository.UserRepository;
import com.core_server.sals.util.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private UserRepository userRepository;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private PasswordEncoder pe;


    // ----- 1. REGISTER (One-time setup helper) -----
    @PostMapping("/register")
    public Map<String, String> register(@RequestBody User user) {
        // Hash the password before saving to MySQL
        user.setPassword(pe.encode(user.getPassword()));
        userRepository.save(user);

        return Map.of("status", "SUCCESS", "message", "User Registered: " + user.getName());
    }

    // ----- 2. LOGIN -----
    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> payload, HttpServletResponse res) {
        String inId = payload.get("userId");
        String inPassword = payload.get("password");

        Optional<User> userOpt = userRepository.findByCustomId(inId);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (pe.matches(inPassword, user.getPassword())) {
                String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getCustomId());

                ResponseCookie cookie = ResponseCookie.from("sals_jwt", token)
                        .httpOnly(true)
                        .secure(true)        // MUST be true for SameSite=None (requires HTTPS)
                        .path("/")
                        .maxAge(10 * 60 * 60) // 10 Hours (matches your JwtUtil)
                        .sameSite("None")    // Required because Vercel and Backend are different domains
                        .build();
                res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

                return Map.of(
                        "status", "SUCCESS",
                        "role", user.getRole(),
                        "userId", user.getCustomId(),
                        "name", user.getName()
                );
            }
        }
        return Map.of("status", "FAIL", "message", "Invalid Credentials");
    }

    // ----- 3. LOGOUT ENDPOINT TO CLEAR COOKIE -----
    @PostMapping("/logout")
    public Map<String, String> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("sals_jwt", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0) // 0 maxAge deletes the cookie immediately
                .sameSite("None")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return Map.of("status", "SUCCESS", "message", "Logged out successfully");
    }
}