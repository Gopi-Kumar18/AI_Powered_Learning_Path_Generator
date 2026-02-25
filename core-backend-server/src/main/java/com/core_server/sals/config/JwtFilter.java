package com.core_server.sals.config;


import com.core_server.sals.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/* Functionality of this code :- If the request has a valid JWT, log the user in for this request.
*  Client → Spring Security → JwtFilter → Controller
*   */

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        // 1. Get the Header (Authorization: Bearer eyJhbGci...)
        final String authHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        // 2. Check if Header is valid
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7); // Remove "Bearer " prefix
            try {
                username = jwtUtil.extractUsername(jwt);
            } catch (Exception e) {
                System.out.println("❌ JWT Token Error: " + e.getMessage());
            }
        }

        // 3. If User is found but not yet authenticated in this Context
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            if (jwtUtil.validateToken(jwt, username)) {
                // Get Role from Token (e.g., "STUDENT")
                String role = jwtUtil.extractRole(jwt);

                // Create the Authentication Object
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        username, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                );

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 4. Set the Authentication in the Context (Log them in!)
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 5. Continue the Request
        chain.doFilter(request, response);
    }
}
