package com.core_server.sals.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;


@Service
public class QRCodeService {


    private final SecretKey key = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    // How long the QR code is valid (in milliseconds).20000ms = 20 seconds.
    private static final long EXPIRATION_TIME = 20000;

    // ----- 1. Dynamic QR Code(nothing but Token) Generation Service Method -----
    public String generateDynamicQrToken(String sessionIdentifier) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "attendance_qr");
        claims.put("sessionId", sessionIdentifier);

        // Current time
        long now = System.currentTimeMillis();

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + EXPIRATION_TIME))
                .signWith(key)
                .compact();
    }

    // ----- 2. Validating The token -----
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true; // Token is valid and not expired
        } catch (Exception e) {
            return false; // Token expired or tampered with
        }
    }

    // ----- 3. METHOD NEEDED FOR ATTENDANCE MARKING -----
    public String extractSessionId(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .get("sessionId", String.class);
        } catch (Exception e) {
            return null;
        }
    }
}