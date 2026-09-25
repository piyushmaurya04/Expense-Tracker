package com.Tracker.Exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * GLOBAL EXCEPTION HANDLER
 * Catches exceptions from all controllers and returns proper error responses
 * 
 * @RestControllerAdvice: Applies to all @RestController classes
 *                        - Intercepts exceptions globally
 *                        - Returns JSON responses
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * HANDLE VALIDATION ERRORS
     * Catches validation errors from @Valid annotation
     * 
     * Example: When user sends invalid email or empty username
     * 
     * @ExceptionHandler: Catches specific exception type
     * @ResponseStatus: Sets HTTP status code
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {

        /**
         * Extract all field errors
         * Example errors:
         * - "username": "Username is required"
         * - "email": "Email should be valid"
         */
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        /**
         * Build error response
         */
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", HttpStatus.BAD_REQUEST.value());
        response.put("error", "Validation Failed");
        response.put("message", "Invalid input data");
        response.put("errors", errors);

        return ResponseEntity.badRequest().body(response);
    }

    /**
     * HANDLE AUTHENTICATION ERRORS
     * Catches bad credentials (wrong username/password)
     * 
     * Example: User enters wrong password during login
     */
    @ExceptionHandler(BadCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(BadCredentialsException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", HttpStatus.UNAUTHORIZED.value());
        response.put("error", "Unauthorized");
        response.put("message", "Invalid username or password");

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    /**
     * HANDLE USER NOT FOUND
     * Catches when user doesn't exist in database
     */
    @ExceptionHandler(UsernameNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<Map<String, Object>> handleUserNotFound(UsernameNotFoundException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", HttpStatus.NOT_FOUND.value());
        response.put("error", "Not Found");
        response.put("message", ex.getMessage());

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    /**
     * HANDLE RUNTIME EXCEPTIONS
     * Catches all RuntimeException (includes our custom exceptions from Service
     * layer)
     * 
     * Examples:
     * - "Unauthorized: You don't have permission to access this expense"
     * - "User not found with id: 123"
     * - "Refresh token was expired"
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        /**
         * Determine HTTP status based on error message
         */
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;

        String message = ex.getMessage();
        if (message != null) {
            if (message.contains("Unauthorized") || message.contains("permission")) {
                status = HttpStatus.FORBIDDEN;
            } else if (message.contains("not found") || message.contains("Not Found")) {
                status = HttpStatus.NOT_FOUND;
            } else if (message.contains("expired") || message.contains("invalid")) {
                status = HttpStatus.UNAUTHORIZED;
            } else if (message.contains("already")) {
                status = HttpStatus.CONFLICT;
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", status.value());
        response.put("error", status.getReasonPhrase());
        response.put("message", ex.getMessage());

        return ResponseEntity.status(status).body(response);
    }

    /**
     * HANDLE ILLEGAL ARGUMENT EXCEPTIONS
     * Catches invalid arguments
     */
    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", HttpStatus.BAD_REQUEST.value());
        response.put("error", "Bad Request");
        response.put("message", ex.getMessage());

        return ResponseEntity.badRequest().body(response);
    }

    /**
     * HANDLE ALL OTHER EXCEPTIONS
     * Catches any exception not handled by above methods
     * 
     * This is a safety net - prevents exposing stack traces to frontend
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseEntity<Map<String, Object>> handleGlobalException(Exception ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        response.put("error", "Internal Server Error");
        response.put("message", "An unexpected error occurred. Please try again later.");

        /**
         * Log the actual error for debugging (not sent to frontend)
         */
        System.err.println("Unexpected error: " + ex.getMessage());
        ex.printStackTrace();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}