package com.core_server.sals.util;


import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    private static final String SECRET_STRING = "MySuperSecretKeyForSalsProject1234567890@#$";

    private static final Key SECRET_KEY = Keys.hmacShaKeyFor(SECRET_STRING.getBytes());

    // ----- 1. Packages user-specific data (role, customId) into a map and triggers token creation. -----
    public String generateToken(String username, String role, String customId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        claims.put("customId", customId);
        return createToken(claims, username);
    }

    // ----- 2. Builds, signs, and generates the final JWT string with a 10-hour expiration timer. -----
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // 10 Hours Validity
                .signWith(SECRET_KEY)
                .compact();
    }

    // ----- 3. Verifies that the token belongs to the requesting user and hasn't expired yet. -----
    public boolean validateToken(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username) && !isTokenExpired(token));
    }

    // ----- 4. Retrieves the "subject" (which is the email/username) from the token's payload. -----
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // ----- 5. Retrieves the embedded "customId" (like "12321662") from the token. -----
    public String extractCustomId(String token) {
        return extractClaim(token, claims -> claims.get("customId", String.class));
    }

    // ----- 6. Retrieves the embedded "role" (STUDENT, TEACHER, ADMIN) from the token -----
    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    // ----- 7. A generic helper method that grabs exactly one specific piece of data from the token's claims.
    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // ----- 8. Uses our secret key to open up the token and read the entire JSON payload inside. -----
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(SECRET_KEY).build().parseClaimsJws(token).getBody();
    }

    // ----- 9. Checks if the token's internal expiration timestamp has passed the current time. -----
    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }
}