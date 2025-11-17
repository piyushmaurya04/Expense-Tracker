package com.Tracker.Security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * AUTHENTICATION ENTRY POINT
 * Handles what happens when unauthorized user tries to access protected
 * resource
 * 
 * Example: User tries to access /api/expenses without JWT token
 * This class sends proper error response
 * 
 * @Component: Spring creates instance of this class
 *             AuthenticationEntryPoint: Spring Security interface for handling
 *             auth errors
 */
@Component
public class AuthEntryPointJwt implements AuthenticationEntryPoint {

    private static final Logger logger = LoggerFactory.getLogger(AuthEntryPointJwt.class);

    /**
     * COMMENCE METHOD
     * Called automatically when unauthorized access is detected
     * 
     * @param request:       The HTTP request that was rejected
     * @param response:      The HTTP response to send back
     * @param authException: The exception that occurred
     */
    @Override
    public void commence(HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException)
            throws IOException, ServletException {

        /**
         * Log the unauthorized access attempt
         */
        logger.error("Unauthorized error: {}", authException.getMessage());

        /**
         * Set response content type to JSON
         */
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        /**
         * Set HTTP status code to 401 Unauthorized
         * 401: Authentication required but not provided or invalid
         */
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        /**
         * Create error response body
         * Frontend will receive this JSON
         */
        final Map<String, Object> body = new HashMap<>();
        body.put("status", HttpServletResponse.SC_UNAUTHORIZED);
        body.put("error", "Unauthorized");
        body.put("message", authException.getMessage());
        body.put("path", request.getServletPath());

        /**
         * ObjectMapper: Converts Java object to JSON
         * Write JSON to response output stream
         */
        final ObjectMapper mapper = new ObjectMapper();
        mapper.writeValue(response.getOutputStream(), body);
    }
}