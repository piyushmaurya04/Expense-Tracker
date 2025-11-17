package com.Tracker.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Tracker.DTO.SignUpRequestDTO;
import com.Tracker.Service.AuthService;

import java.util.HashMap;
import java.util.Map;

/**
 * TEST CONTROLLER
 * Simple public endpoint to test if server is running
 */
@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired(required = false)
    private AuthService authService;

    @GetMapping("/hello")
    public Map<String, String> hello() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Hello! Server is running!");
        response.put("status", "OK");
        response.put("authServiceLoaded", authService != null ? "YES" : "NO");
        return response;
    }

    @PostMapping("/register-test")
    public Map<String, Object> testRegister(@RequestBody SignUpRequestDTO request) {
        Map<String, Object> response = new HashMap<>();
        response.put("received", "OK");
        response.put("username", request.getUsername());
        response.put("email", request.getEmail());
        response.put("authServiceAvailable", authService != null);
        return response;
    }
}
