package com.Tracker.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.Tracker.Entity.RefreshToken;
import com.Tracker.Entity.User;
import com.Tracker.Repository.RefreshTokenRepository;
import com.Tracker.Repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class RefreshTokenService {

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;
    @Autowired
    private UserRepository userRepository;
    @Value("${jwt.refreshExpiration:604800000}")
    private Long refreshTokenDurationMs;

    @Transactional
    public RefreshToken createRefreshToken(Long userId) {
        /**
         * STEP 1: Find user
         */
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        /**
         * STEP 2: Delete existing refresh tokens for this user
         * This ensures user has only one valid refresh token at a time
         * (You can skip this if you want multiple devices support)
         */
        refreshTokenRepository.deleteByUserId(userId);

        /**
         * STEP 3: Create new refresh token
         */
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);

        /**
         * Generate random token string using UUID
         * UUID: Universally Unique Identifier (e.g.,
         * "550e8400-e29b-41d4-a716-446655440000")
         */
        refreshToken.setToken(UUID.randomUUID().toString());

        /**
         * Set expiry date (current time + 7 days)
         */
        refreshToken.setExpiryDate(LocalDateTime.now().plusSeconds(refreshTokenDurationMs / 1000));

        /**
         * STEP 4: Save to database
         */
        return refreshTokenRepository.save(refreshToken);
    }

    /**
     * FIND BY TOKEN
     * Searches for refresh token in database
     * 
     * @param token: Refresh token string
     * @return Optional<RefreshToken>
     */
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    /**
     * VERIFY EXPIRATION
     * Checks if refresh token is expired
     * If expired, deletes it from database
     * 
     * @param token: RefreshToken entity
     * @return RefreshToken if valid
     * @throws RuntimeException if expired
     */
    @Transactional
    public RefreshToken verifyExpiration(RefreshToken token) {
        /**
         * Check if token expiry date is before current time
         */
        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            /**
             * Token is expired - delete it
             */
            refreshTokenRepository.delete(token);

            /**
             * Throw exception
             */
            throw new RuntimeException("Refresh token was expired. Please make a new login request");
        }

        /**
         * Token is still valid
         */
        return token;
    }

    /**
     * DELETE BY USER ID
     * Removes all refresh tokens for a user
     * Called during logout
     * 
     * @Transactional: Ensures database operation is atomic
     */
    @Transactional
    public void deleteByUserId(Long userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }

}
