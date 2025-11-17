package com.Tracker.DTO;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

public class JwtResponseDTO {
    private String accessToken;

    /**
     * Token type (always "Bearer")
     */
    private String tokenType = "Bearer";

    /**
     * Refresh Token: Long-lived token to get new access tokens
     */
    private String refreshToken;

    /**
     * User information (safe to send to frontend)
     */
    private Long id;
    private String username;
    private String email;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    // ==================== CONSTRUCTORS ====================

    public JwtResponseDTO() {
    }

    public JwtResponseDTO(String accessToken, String refreshToken, Long id,
            String username, String email, LocalDateTime createdAt) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.id = id;
        this.username = username;
        this.email = email;
        this.createdAt = createdAt;
    }

    // ==================== GETTERS AND SETTERS ====================

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
