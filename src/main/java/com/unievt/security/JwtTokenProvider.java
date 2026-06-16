package com.unievt.security;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Slf4j
@Component
public class JwtTokenProvider {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.access-token-expiry-ms}")
    private long accessTokenExpiryMs;

    public String generateAccessToken(CustomUserDetails userDetails) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + accessTokenExpiryMs);

        String roleName = userDetails.getRole() != null ? userDetails.getRole().name() : "USER";

        return Jwts.builder()
                .subject(userDetails.getId().toString())
                .claim("email", userDetails.getUsername())
                .claim("role", roleName)
                .claim("emailVerified", userDetails.getEmailVerified() != null && userDetails.getEmailVerified())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(secretKey(), Jwts.SIG.HS256)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(secretKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    public Long extractUserId(String token) {
        String subject = Jwts.parser()
                .verifyWith(secretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
        return Long.parseLong(subject);
    }

    public String extractEmail(String token) {
        return Jwts.parser()
                .verifyWith(secretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("email", String.class);
    }

    private SecretKey secretKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
}
