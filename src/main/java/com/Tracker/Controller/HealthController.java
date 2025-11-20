package com.Tracker.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

/**
 * HEALTH CHECK CONTROLLER
 * Provides endpoints to verify application and database health
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    @Autowired
    private DataSource dataSource;

    /**
     * Application is running
     */
    @GetMapping
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "Application is running");
        return ResponseEntity.ok(response);
    }

    /**
     * Test database connection
     */
    @GetMapping("/db")
    public ResponseEntity<Map<String, String>> dbHealth() {
        Map<String, String> response = new HashMap<>();
        try {
            Connection connection = dataSource.getConnection();
            connection.close();
            response.put("status", "UP");
            response.put("database", "Connected successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "DOWN");
            response.put("database", "Connection failed: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
