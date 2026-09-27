package com.Tracker.Security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Base64;

import javax.crypto.SecretKey;

import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

class JwtUtilsTest {

    private final String secret = Base64.getEncoder()
            .encodeToString(Keys.secretKeyFor(SignatureAlgorithm.HS256).getEncoded());
    private final JwtUtils jwtUtils = new JwtUtils(secret);

    @Test
    void generateJwtToken_shouldCreateValidToken() {
        UserDetailsImpl userDetails = new UserDetailsImpl(1L, "alice", "alice@email.com", "encoded-password", null);
        Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, "secret123",
                userDetails.getAuthorities());

        String token = jwtUtils.generateJwtToken(authentication);

        assertNotNull(token);
        assertTrue(jwtUtils.validateJwtToken(token));
        assertEquals("alice", jwtUtils.getUserNameFromJwtToken(token));
    }

    @Test
    void generateTokenFromUsername_shouldCreateToken() {
        String token = jwtUtils.generateTokenFromUsername("bob");

        assertNotNull(token);
        assertTrue(jwtUtils.validateJwtToken(token));
        assertEquals("bob", jwtUtils.getUserNameFromJwtToken(token));
    }
}
