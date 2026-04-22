package com.core_server.sals.controller;


import com.core_server.sals.model.PassResetToken;
import com.core_server.sals.model.User;
import com.core_server.sals.repository.PassRstTokenRepository;
import com.core_server.sals.repository.UserRepository;
import com.core_server.sals.service.EmailAlertService;
import com.core_server.sals.util.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private PasswordEncoder pe;
    @Autowired
    private PassRstTokenRepository prTokenRepo;
    @Autowired
    private EmailAlertService eas;


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
                        "name", user.getName(),
                        "email",user.getEmail()
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

    // ----- 3. FORGOT PASSWORD (Generate Token & Send Email) -----
    @PostMapping("/forgot-password")
    @Transactional // Ensures previous tokens are deleted safely
    public Map<String, String> forgotPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            prTokenRepo.deleteByUser(user);

            String token = java.util.UUID.randomUUID().toString();

            PassResetToken prt = new PassResetToken(token, user);
            prTokenRepo.save(prt);

            eas.sendPasswordResetEmail(user.getEmail(), user.getName(), token);
        }
        return Map.of(
                "status", "SUCCESS",
                "message", "If an account with that email exists, a reset link has been sent."
        );
    }

    // ----- 4. RESET PASSWORD (Validate Token & Update Password) -----
    @PostMapping("/reset-password")
    @Transactional
    public Map<String, String> resetPassword(@RequestBody Map<String, String> payload) {
        String token = payload.get("token");
        String newPassword = payload.get("newPassword");

        Optional<PassResetToken> tokenOpt = prTokenRepo.findByToken(token);

        if (tokenOpt.isEmpty()) {
            return Map.of("status", "FAIL", "message", "Invalid password reset token.");
        }

        PassResetToken prt = tokenOpt.get();

        if (prt.isExpired()) {
            prTokenRepo.delete(prt);
            return Map.of("status", "FAIL", "message", "Token has expired. Please request a new one.");
        }

        User user = prt.getUser();
        user.setPassword(pe.encode(newPassword));
        userRepository.save(user);

        prTokenRepo.delete(prt);

        return Map.of("status", "SUCCESS", "message", "Password has been successfully updated.");
    }

    // ----- 5. CHANGE PASSWORD (For Logged-in Users) -----
    @PostMapping("/change-password")
    public Map<String, String> changePassword(@RequestBody Map<String, String> payload) {
        // 5.1 --- Verify the user is actually logged in ---
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return Map.of("status", "FAIL", "message", "You must be logged in to change your password.");
        }

        String email = auth.getName();

        String currentPassword = payload.get("currentPassword");
        String newPassword = payload.get("newPassword");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return Map.of("status", "FAIL", "message", "User not found.");
        }

        User user = userOpt.get();

        // 5.2 --- Security Check: Verify they know their current password ---
        if (!pe.matches(currentPassword, user.getPassword())) {
            return Map.of("status", "FAIL", "message", "Incorrect current password.");
        }

        // 5.3 --- Security Check: Prevent reusing the same password ---
        if (pe.matches(newPassword, user.getPassword())) {
            return Map.of("status", "FAIL", "message", "New password must be different from your current password.");
        }

        // 5.4 --- Update the password ---
        user.setPassword(pe.encode(newPassword));
        userRepository.save(user);

        return Map.of("status", "SUCCESS", "message", "Your password has been successfully updated.");
    }
}