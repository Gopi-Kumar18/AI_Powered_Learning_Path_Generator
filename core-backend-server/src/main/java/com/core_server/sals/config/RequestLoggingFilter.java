package com.core_server.sals.config;


import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. CAPTURE INCOMING (Detector Triggered)
        long startTime = System.currentTimeMillis();
        System.out.println("⬇️ [INCOMING] " + request.getMethod() + " " + request.getRequestURI() + " from IP: " + request.getRemoteAddr());

        // 2. CONTINUE (Pass request to Controller)
        filterChain.doFilter(request, response);

        // 3. CAPTURE OUTGOING (Response Sending)
        long duration = System.currentTimeMillis() - startTime;
        System.out.println("⬆️ [OUTGOING] Status: " + response.getStatus() + " | Time: " + duration + "ms");
        System.out.println("------------------------------------------------------");
    }
}