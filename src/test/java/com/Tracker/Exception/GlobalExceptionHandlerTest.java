package com.Tracker.Exception;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.lang.reflect.Method;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleValidationExceptions_shouldReturnBadRequest() throws NoSuchMethodException {
        Method method = SampleRequest.class.getDeclaredMethod("submit", String.class);
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new SampleRequest(), "sampleRequest");
        bindingResult.rejectValue("name", "NotBlank", "Name is required");

        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(
                new org.springframework.core.MethodParameter(method, 0), bindingResult);

        ResponseEntity<Map<String, Object>> response = handler.handleValidationExceptions(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals(400, response.getBody().get("status"));
        assertEquals("Validation Failed", response.getBody().get("error"));
        assertNotNull(response.getBody().get("timestamp"));
        assertTrue(((Map<?, ?>) response.getBody().get("errors")).containsKey("name"));
    }

    @Test
    void handleBadCredentials_shouldReturnUnauthorized() {
        ResponseEntity<Map<String, Object>> response = handler
                .handleBadCredentials(new BadCredentialsException("Bad credentials"));

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals(401, response.getBody().get("status"));
        assertEquals("Unauthorized", response.getBody().get("error"));
    }

    @Test
    void handleUserNotFound_shouldReturnNotFound() {
        ResponseEntity<Map<String, Object>> response = handler
                .handleUserNotFound(new UsernameNotFoundException("User Not Found with username: alice"));

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals(404, response.getBody().get("status"));
        assertEquals("User Not Found with username: alice", response.getBody().get("message"));
    }

    @Test
    void handleRuntimeException_shouldMapUnauthorizedAndNotFound() {
        ResponseEntity<Map<String, Object>> unauthorized = handler
                .handleRuntimeException(new RuntimeException("Unauthorized: no permission"));
        ResponseEntity<Map<String, Object>> notFound = handler
                .handleRuntimeException(new RuntimeException("User not found with id: 5"));

        assertEquals(HttpStatus.FORBIDDEN, unauthorized.getStatusCode());
        assertEquals(HttpStatus.NOT_FOUND, notFound.getStatusCode());
    }

    @Test
    void handleIllegalArgument_shouldReturnBadRequest() {
        ResponseEntity<Map<String, Object>> response = handler
                .handleIllegalArgument(new IllegalArgumentException("Invalid value"));

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Bad Request", response.getBody().get("error"));
        assertEquals("Invalid value", response.getBody().get("message"));
    }

    @Test
    void handleGlobalException_shouldReturnInternalServerError() {
        ResponseEntity<Map<String, Object>> response = handler.handleGlobalException(new RuntimeException("boom"));

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals(500, response.getBody().get("status"));
        assertEquals("Internal Server Error", response.getBody().get("error"));
        assertNotNull(response.getBody().get("timestamp"));
    }

    static class SampleRequest {
        private String name;

        public String submit(String value) {
            this.name = value;
            return value;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }
}
