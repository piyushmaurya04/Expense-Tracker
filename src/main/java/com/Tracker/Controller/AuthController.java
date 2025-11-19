package com.Tracker.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Tracker.DTO.JwtResponseDTO;
import com.Tracker.DTO.LoginRequestDTO;
import com.Tracker.DTO.MessageResponseDTO;
import com.Tracker.DTO.RefreshTokenRequest;
import com.Tracker.DTO.SignUpRequestDTO;
import com.Tracker.DTO.UpdateUserRequestDTO;
import com.Tracker.Security.UserDetailsImpl;
import com.Tracker.Service.AuthService;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;

/**
 * AUTHENTICATION CONTROLLER
 * Handles all authentication-related endpoints
 * 
 * @RestController: Combines @Controller + @ResponseBody
 *                  - Returns data directly as JSON (not view/HTML)
 * 
 * @RequestMapping: Base URL for all endpoints in this controller
 *                  - All endpoints will start with /api/auth
 * 
 * @CrossOrigin: Allows requests from React app (already configured in
 *               SecurityConfig, but can add here too)
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * REGISTER ENDPOINT
     * POST /api/auth/register
     * 
     * @PostMapping: Handles HTTP POST requests
     * @RequestBody: Converts JSON from frontend to Java object
     * @Valid: Triggers validation annotations in DTO (e.g., @NotBlank, @Email)
     * 
     *         Request Body:
     *         {
     *         "username": "john",
     *         "email": "john@email.com",
     *         "password": "123456"
     *         }
     * 
     *         Response:
     *         {
     *         "message": "User registered successfully!"
     *         }
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignUpRequestDTO signupRequest) {
        /**
         * Call service method to register user
         */
        MessageResponseDTO response = authService.registerUser(signupRequest);

        /**
         * ResponseEntity: Wrapper for HTTP response
         * ok(): HTTP 200 status code
         * body(response): JSON response body
         */
        return ResponseEntity.ok(response);
    }

    /**
     * LOGIN ENDPOINT
     * POST /api/auth/login
     * 
     * Request Body:
     * {
     * "username": "john",
     * "password": "123456"
     * }
     * 
     * Response:
     * {
     * "accessToken": "eyJhbGc...",
     * "tokenType": "Bearer",
     * "refreshToken": "550e8400-e29b-41d4...",
     * "id": 1,
     * "username": "john",
     * "email": "john@email.com"
     * }
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequestDTO loginRequest) {
        /**
         * Call service method to login user
         * Returns JWT tokens and user info
         */
        JwtResponseDTO response = authService.loginUser(loginRequest);

        return ResponseEntity.ok(response);
    }

    /**
     * REFRESH TOKEN ENDPOINT
     * POST /api/auth/refresh
     * 
     * Used when access token expires (after 24 hours)
     * Frontend sends refresh token to get new access token
     * 
     * Request Body:
     * {
     * "refreshToken": "550e8400-e29b-41d4..."
     * }
     * 
     * Response:
     * {
     * "accessToken": "NEW_TOKEN_HERE",
     * "tokenType": "Bearer",
     * "refreshToken": "550e8400-e29b-41d4...",
     * "id": 1,
     * "username": "john",
     * "email": "john@email.com"
     * }
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        /**
         * Call service method to refresh access token
         */
        JwtResponseDTO response = authService.refreshAccessToken(request.getRefreshToken());

        return ResponseEntity.ok(response);
    }

    /**
     * LOGOUT ENDPOINT
     * POST /api/auth/logout
     * 
     * Requires authentication (JWT token in header)
     * 
     * @AuthenticationPrincipal: Automatically injects logged-in user details
     *                           - Spring Security extracts user from JWT token
     *                           - We don't need to parse token manually!
     * 
     *                           Request Header:
     *                           Authorization: Bearer eyJhbGc...
     * 
     *                           Response:
     *                           {
     *                           "message": "User logged out successfully!"
     *                           }
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        /**
         * Get user ID from logged-in user
         * userDetails was extracted from JWT token automatically!
         */
        Long userId = userDetails.getId();

        /**
         * Call service method to logout
         * This deletes all refresh tokens for the user
         */
        MessageResponseDTO response = authService.logoutUser(userId);

        return ResponseEntity.ok(response);
    }

    /**
     * GET CURRENT USER INFO
     * GET /api/auth/me
     * 
     * Returns information about currently logged-in user
     * Requires authentication (JWT token)
     * 
     * Response:
     * {
     * "id": 1,
     * "username": "john",
     * "email": "john@email.com"
     * }
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        /**
         * userDetails contains logged-in user info
         * NO password included!
         */
        Map<String, Object> response = new HashMap<>();
        response.put("id", userDetails.getId());
        response.put("username", userDetails.getUsername());
        response.put("email", userDetails.getEmail());

        return ResponseEntity.ok(response);
    }

    /**
     * UPDATE USER PROFILE
     * PUT /api/auth/update
     * 
     * Updates username and/or email for logged-in user
     * Requires authentication (JWT token)
     * 
     * Request Body:
     * {
     * "username": "newusername",
     * "email": "newemail@email.com"
     * }
     * 
     * Response:
     * {
     * "message": "User profile updated successfully!"
     * }
     */
    @PutMapping("/update")
    public ResponseEntity<?> updateUser(
            @Valid @RequestBody UpdateUserRequestDTO updateRequest,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        /**
         * Get user ID from logged-in user
         */
        Long userId = userDetails.getId();

        /**
         * Call service method to update user
         */
        MessageResponseDTO response = authService.updateUser(userId, updateRequest);

        return ResponseEntity.ok(response);
    }

}