package com.Tracker.Service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.Tracker.Entity.RefreshToken;
import com.Tracker.Entity.User;
import com.Tracker.Repository.RefreshTokenRepository;
import com.Tracker.Repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private RefreshTokenService refreshTokenService;

    private void setRefreshTokenDurationMs(Long value) throws Exception {
        Field field = RefreshTokenService.class.getDeclaredField("refreshTokenDurationMs");
        field.setAccessible(true);
        field.set(refreshTokenService, value);
    }

    @Test
    void createRefreshToken_whenUserExists_createsAndSavesToken() throws Exception {
        setRefreshTokenDurationMs(604800000L);

        User user = new User("alice", "alice@email.com", "encoded-password");
        user.setId(1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(refreshTokenRepository.save(org.mockito.ArgumentMatchers.any(RefreshToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        RefreshToken token = refreshTokenService.createRefreshToken(1L);

        assertNotNull(token);
        assertEquals(user, token.getUser());
        assertNotNull(token.getToken());
        assertNotNull(token.getExpiryDate());
        verify(refreshTokenRepository).deleteByUserId(1L);
        verify(refreshTokenRepository).save(org.mockito.ArgumentMatchers.any(RefreshToken.class));
    }

    @Test
    void findByToken_shouldReturnSavedToken() {
        RefreshToken token = new RefreshToken();
        token.setToken("refresh-token");

        when(refreshTokenRepository.findByToken("refresh-token")).thenReturn(Optional.of(token));

        Optional<RefreshToken> result = refreshTokenService.findByToken("refresh-token");

        assertEquals(token, result.orElse(null));
    }

    @Test
    void verifyExpiration_whenTokenExpired_throwsRuntimeExceptionAndDeletesToken() {
        RefreshToken token = new RefreshToken();
        token.setExpiryDate(LocalDateTime.now().minusMinutes(1));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> refreshTokenService.verifyExpiration(token));

        assertEquals("Refresh token was expired. Please make a new login request", ex.getMessage());
        verify(refreshTokenRepository).delete(token);
    }

    @Test
    void verifyExpiration_whenTokenValid_returnsToken() {
        RefreshToken token = new RefreshToken();
        token.setExpiryDate(LocalDateTime.now().plusMinutes(10));

        RefreshToken result = refreshTokenService.verifyExpiration(token);

        assertEquals(token, result);
    }

    @Test
    void deleteByUserId_shouldDeleteUserTokens() {
        refreshTokenService.deleteByUserId(7L);

        verify(refreshTokenRepository).deleteByUserId(7L);
    }
}
