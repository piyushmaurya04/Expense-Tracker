package com.Tracker.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * TEMPORARY TEST SECURITY CONFIG
 * This disables ALL security temporarily to test if endpoints work
 * 
 * IMPORTANT: Comment out the SecurityConfig.java before using this!
 * Or rename this class to something else when not testing
 */
// @Configuration
// @EnableWebSecurity
public class TestSecurityConfig {

    // @Bean
    public SecurityFilterChain testFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll() // Allow ALL requests
                );

        return http.build();
    }
}
