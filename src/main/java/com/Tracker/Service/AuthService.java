package com.Tracker.Service;

import com.Tracker.DTO.JwtResponseDTO;
import com.Tracker.DTO.LoginRequestDTO;
import com.Tracker.DTO.MessageResponseDTO;
import com.Tracker.DTO.SignUpRequestDTO;
import com.Tracker.Entity.RefreshToken;
import com.Tracker.Entity.User;
import com.Tracker.Repository.UserRepository;
import com.Tracker.Security.JwtUtils;
import com.Tracker.Security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * AUTHENTICATION SERVICE
 * Handles user registration and login
 * 
 * @Service: Marks this as service component
 */
@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private RefreshTokenService refreshTokenService;

    /**
     * REGISTER NEW USER
     * Creates new user account with encrypted password
     * 
     * @param signupRequest: Contains username, email, password
     * @return MessageResponse with success/error message
     */
    public MessageResponseDTO registerUser(SignUpRequestDTO signupRequest) {
        /**
         * STEP 1: Check if username already exists
         */
        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            return new MessageResponseDTO("Error: Username is already taken!");
        }

        /**
         * STEP 2: Check if email already exists
         */
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            return new MessageResponseDTO("Error: Email is already in use!");
        }

        /**
         * STEP 3: Create new user
         */
        User user = new User();
        user.setUsername(signupRequest.getUsername());
        user.setEmail(signupRequest.getEmail());

        /**
         * ENCRYPT PASSWORD using BCrypt
         * NEVER store plain passwords!
         * 
         * Example:
         * Plain: "123456"
         * Encrypted: "$2a$10$N9qo8uLOickgx2ZMRZoMye.IcAJQQ8NvP9xJ7R.3R0L0I6CqH.Y1i"
         */
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));

        /**
         * STEP 4: Save user to database
         */
        userRepository.save(user);

        return new MessageResponseDTO("User registered successfully!");
    }

    /**
     * LOGIN USER
     * Authenticates user and generates JWT tokens
     * 
     * @param loginRequest: Contains username and password
     * @return JwtResponse with access token, refresh token, and user info
     */
    public JwtResponseDTO loginUser(LoginRequestDTO loginRequest) {
        /**
         * STEP 1: Authenticate user
         * AuthenticationManager checks username and password
         * It calls UserDetailsServiceImpl.loadUserByUsername()
         * Then compares passwords using BCrypt
         */
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()));

        /**
         * STEP 2: Set authentication in Security Context
         * Now Spring Security knows user is logged in
         */
        SecurityContextHolder.getContext().setAuthentication(authentication);

        /**
         * STEP 3: Generate JWT access token
         * This token expires in 24 hours (or whatever we configured)
         */
        String jwt = jwtUtils.generateJwtToken(authentication);

        /**
         * STEP 4: Get user details from authentication
         */
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        /**
         * STEP 5: Create refresh token
         * This token expires in 7 days (long-lived)
         * Used to get new access tokens without re-login
         */
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());

        /**
         * STEP 6: Return response with tokens and user info
         * NO PASSWORD included!
         */
        return new JwtResponseDTO(
                jwt,
                refreshToken.getToken(),
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                userDetails.getCreatedAt());
    }

    /**
     * REFRESH ACCESS TOKEN
     * Generates new access token using refresh token
     * Called when access token expires
     * 
     * @param refreshTokenStr: Refresh token string
     * @return JwtResponse with new access token
     */
    public JwtResponseDTO refreshAccessToken(String refreshTokenStr) {
        /**
         * STEP 1: Find refresh token in database
         */
        RefreshToken refreshToken = refreshTokenService.findByToken(refreshTokenStr)
                .orElseThrow(() -> new RuntimeException("Refresh token not found!"));

        /**
         * STEP 2: Verify token is not expired
         */
        refreshToken = refreshTokenService.verifyExpiration(refreshToken);

        /**
         * STEP 3: Get user from refresh token
         */
        User user = refreshToken.getUser();

        /**
         * STEP 4: Generate new access token
         */
        String newAccessToken = jwtUtils.generateTokenFromUsername(user.getUsername());

        /**
         * STEP 5: Return response with new access token
         * Keep same refresh token (no need to regenerate)
         */
        return new JwtResponseDTO(
                newAccessToken,
                refreshTokenStr,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getCreatedAt());
    }

    /**
     * LOGOUT USER
     * Deletes all refresh tokens for user
     * 
     * @param userId: User ID
     * @return MessageResponse
     */
    public MessageResponseDTO logoutUser(Long userId) {
        /**
         * Delete all refresh tokens for this user
         * This invalidates all sessions
         */
        refreshTokenService.deleteByUserId(userId);

        return new MessageResponseDTO("User logged out successfully!");
    }

    /**
     * UPDATE USER PROFILE
     * Updates username and/or email for the user
     * 
     * @param userId:        User ID
     * @param updateRequest: Contains new username and email
     * @return MessageResponse
     */
    public MessageResponseDTO updateUser(Long userId, com.Tracker.DTO.UpdateUserRequestDTO updateRequest) {
        /**
         * STEP 1: Find user by ID
         */
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        /**
         * STEP 2: Check if new username is already taken by another user
         */
        if (!user.getUsername().equals(updateRequest.getUsername()) &&
                userRepository.existsByUsername(updateRequest.getUsername())) {
            return new MessageResponseDTO("Error: Username is already taken!");
        }

        /**
         * STEP 3: Check if new email is already taken by another user
         */
        if (!user.getEmail().equals(updateRequest.getEmail()) &&
                userRepository.existsByEmail(updateRequest.getEmail())) {
            return new MessageResponseDTO("Error: Email is already in use!");
        }

        /**
         * STEP 4: Update user details
         */
        user.setUsername(updateRequest.getUsername());
        user.setEmail(updateRequest.getEmail());

        /**
         * STEP 5: Save updated user
         */
        userRepository.save(user);

        return new MessageResponseDTO("User profile updated successfully!");
    }
}