package com.Tracker.DTO;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO: Sent from frontend to refresh access token
 */
public class RefreshTokenRequest {
    
    @NotBlank(message = "Refresh token is required")
    private String refreshToken;
    
    // ==================== CONSTRUCTORS ====================
    
    public RefreshTokenRequest() {
    }
    
    public RefreshTokenRequest(String refreshToken) {
        this.refreshToken = refreshToken;
    }
    
    // ==================== GETTERS AND SETTERS ====================
    
    public String getRefreshToken() {
        return refreshToken;
    }
    
    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}