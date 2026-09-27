package com.Tracker.Controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.Tracker.DTO.JwtResponseDTO;
import com.Tracker.DTO.LoginRequestDTO;
import com.Tracker.DTO.MessageResponseDTO;
import com.Tracker.DTO.RefreshTokenRequest;
import com.Tracker.DTO.SignUpRequestDTO;
import com.Tracker.DTO.UpdateUserRequestDTO;
import com.Tracker.Security.UserDetailsImpl;
import com.Tracker.Service.AuthService;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    @Test
    void registerUser_shouldReturnSuccessMessage() {
        SignUpRequestDTO request = new SignUpRequestDTO("alice", "alice@email.com", "secret123");
        MessageResponseDTO expected = new MessageResponseDTO("User registered successfully!");

        when(authService.registerUser(any(SignUpRequestDTO.class))).thenReturn(expected);

        ResponseEntity<?> response = authController.registerUser(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(authService).registerUser(request);
    }

    @Test
    void loginUser_shouldReturnJwtPayload() {
        LoginRequestDTO request = new LoginRequestDTO("alice", "secret123");
        JwtResponseDTO expected = new JwtResponseDTO("jwt-token", "refresh-token", 1L, "alice", "alice@email.com",
                LocalDateTime.now());

        when(authService.loginUser(any(LoginRequestDTO.class))).thenReturn(expected);

        ResponseEntity<?> response = authController.loginUser(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(authService).loginUser(request);
    }

    @Test
    void refreshToken_shouldReturnNewJwtPayload() {
        RefreshTokenRequest request = new RefreshTokenRequest("refresh-token");
        JwtResponseDTO expected = new JwtResponseDTO("new-access-token", "refresh-token", 1L, "alice",
                "alice@email.com", LocalDateTime.now());

        when(authService.refreshAccessToken("refresh-token")).thenReturn(expected);

        ResponseEntity<?> response = authController.refreshToken(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(authService).refreshAccessToken("refresh-token");
    }

    @Test
    void logoutUser_shouldReturnLogoutMessage() {
        UserDetailsImpl userDetails = new UserDetailsImpl(7L, "alice", "alice@email.com", "secret123",
                LocalDateTime.now());
        MessageResponseDTO expected = new MessageResponseDTO("User logged out successfully!");

        when(authService.logoutUser(7L)).thenReturn(expected);

        ResponseEntity<?> response = authController.logoutUser(userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(authService).logoutUser(7L);
    }

    @Test
    void getCurrentUser_shouldReturnUserMap() {
        UserDetailsImpl userDetails = new UserDetailsImpl(12L, "alice", "alice@email.com", "secret123",
                LocalDateTime.now());

        ResponseEntity<Map<String, Object>> response = authController.getCurrentUser(userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(12L, response.getBody().get("id"));
        assertEquals("alice", response.getBody().get("username"));
        assertEquals("alice@email.com", response.getBody().get("email"));
    }

    @Test
    void updateUser_shouldReturnUpdatedMessage() {
        UserDetailsImpl userDetails = new UserDetailsImpl(9L, "alice", "alice@email.com", "secret123",
                LocalDateTime.now());
        UpdateUserRequestDTO request = new UpdateUserRequestDTO("newalice", "newalice@email.com");
        MessageResponseDTO expected = new MessageResponseDTO("User profile updated successfully!");

        when(authService.updateUser(9L, request)).thenReturn(expected);

        ResponseEntity<?> response = authController.updateUser(request, userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        assertNotNull(response.getBody());
        verify(authService).updateUser(9L, request);
    }
}
