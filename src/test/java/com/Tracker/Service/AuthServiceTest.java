package com.Tracker.Service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.Tracker.DTO.JwtResponseDTO;
import com.Tracker.DTO.LoginRequestDTO;
import com.Tracker.DTO.MessageResponseDTO;
import com.Tracker.DTO.SignUpRequestDTO;
import com.Tracker.DTO.UpdateUserRequestDTO;
import com.Tracker.Entity.RefreshToken;
import com.Tracker.Entity.User;
import com.Tracker.Repository.UserRepository;
import com.Tracker.Security.JwtUtils;
import com.Tracker.Security.UserDetailsImpl;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private RefreshTokenService refreshTokenService;

    @InjectMocks
    private AuthService authService;

    @Test
    void registerUser_whenUsernameExists_returnsErrorMessage() {
        SignUpRequestDTO request = new SignUpRequestDTO("alice", "alice@email.com", "secret123");

        when(userRepository.existsByUsername("alice")).thenReturn(true);

        MessageResponseDTO response = authService.registerUser(request);

        assertEquals("Error: Username is already taken!", response.getMessage());
    }

    @Test
    void registerUser_whenValid_savesUserAndReturnsSuccessMessage() {
        SignUpRequestDTO request = new SignUpRequestDTO("alice", "alice@email.com", "secret123");
        User savedUser = new User("alice", "alice@email.com", "encoded-password");

        when(userRepository.existsByUsername("alice")).thenReturn(false);
        when(userRepository.existsByEmail("alice@email.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        MessageResponseDTO response = authService.registerUser(request);

        assertEquals("User registered successfully!", response.getMessage());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void loginUser_shouldGenerateJwtAndRefreshToken() {
        LoginRequestDTO request = new LoginRequestDTO("alice", "secret123");
        UserDetailsImpl principal = new UserDetailsImpl(1L, "alice", "alice@email.com", "encoded-password",
                LocalDateTime.now());
        Authentication authentication = new UsernamePasswordAuthenticationToken(principal, "secret123",
                principal.getAuthorities());
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken("refresh-token");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn("jwt-token");
        when(refreshTokenService.createRefreshToken(1L)).thenReturn(refreshToken);

        JwtResponseDTO response = authService.loginUser(request);

        assertEquals("jwt-token", response.getAccessToken());
        assertEquals("refresh-token", response.getRefreshToken());
        assertEquals("alice", response.getUsername());
        assertEquals("alice@email.com", response.getEmail());
    }

    @Test
    void refreshAccessToken_shouldReturnNewAccessToken() {
        User user = new User("alice", "alice@email.com", "encoded-password");
        user.setId(1L);
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken("refresh-token");
        refreshToken.setUser(user);

        when(refreshTokenService.findByToken("refresh-token")).thenReturn(Optional.of(refreshToken));
        when(refreshTokenService.verifyExpiration(refreshToken)).thenReturn(refreshToken);
        when(jwtUtils.generateTokenFromUsername("alice")).thenReturn("new-jwt-token");

        JwtResponseDTO response = authService.refreshAccessToken("refresh-token");

        assertEquals("new-jwt-token", response.getAccessToken());
        assertEquals("refresh-token", response.getRefreshToken());
        assertEquals("alice", response.getUsername());
    }

    @Test
    void logoutUser_shouldDeleteAllRefreshTokens() {
        MessageResponseDTO response = authService.logoutUser(5L);

        verify(refreshTokenService).deleteByUserId(5L);
        assertEquals("User logged out successfully!", response.getMessage());
    }

    @Test
    void updateUser_whenValid_shouldUpdateProfile() {
        User user = new User("oldname", "old@email.com", "encoded-password");
        user.setId(3L);
        UpdateUserRequestDTO request = new UpdateUserRequestDTO("newname", "new@email.com");

        when(userRepository.findById(3L)).thenReturn(Optional.of(user));
        when(userRepository.existsByUsername("newname")).thenReturn(false);
        when(userRepository.existsByEmail("new@email.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MessageResponseDTO response = authService.updateUser(3L, request);

        assertEquals("User profile updated successfully!", response.getMessage());
        assertEquals("newname", user.getUsername());
        assertEquals("new@email.com", user.getEmail());
    }
}
