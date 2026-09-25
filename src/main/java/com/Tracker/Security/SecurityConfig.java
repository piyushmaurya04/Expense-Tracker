package com.Tracker.Security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import java.util.List;

/**
 * SECURITY CONFIGURATION CLASS
 * Central place for all security settings
 * 
 * @Configuration: Tells Spring this class contains configuration
 * @EnableWebSecurity: Enables Spring Security
 * @EnableMethodSecurity: Allows @PreAuthorize, @Secured annotations on methods
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    /**
     * Inject our custom UserDetailsService
     */
    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    /**
     * Inject our custom authentication entry point
     */
    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;

    /**
     * CREATE AUTH TOKEN FILTER BEAN
     * 
     * @Bean: Tells Spring to manage this object
     *        Spring will create one instance and inject it where needed
     */
    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }

    /**
     * PASSWORD ENCODER BEAN
     * BCrypt: Strong one-way encryption algorithm for passwords
     * 
     * How it works:
     * - plain password "123456" → encrypted "$2a$10$XxY..."
     * - Cannot decrypt back to "123456"
     * - Can only verify if plain password matches encrypted one
     * - Even same password produces different encrypted strings (salt)
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * AUTHENTICATION PROVIDER
     * Connects UserDetailsService with PasswordEncoder
     * Tells Spring Security how to:
     * 1. Load user from database (using UserDetailsService)
     * 2. Verify password (using PasswordEncoder)
     */
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();

        // Set our custom UserDetailsService
        authProvider.setUserDetailsService(userDetailsService);

        // Set password encoder
        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }

    /**
     * AUTHENTICATION MANAGER BEAN
     * Used in AuthController to authenticate users during login
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig)
            throws Exception {
        return authConfig.getAuthenticationManager();
    }

    /**
     * SECURITY FILTER CHAIN
     * This is the MAIN security configuration
     * Defines which URLs are public and which require authentication
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**", "/api/test/**", "/error").permitAll()
                        .anyRequest().authenticated())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
                .addFilterBefore(authenticationJwtTokenFilter(),
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * CORS CONFIGURATION
     * Allows frontend (React) to call backend (Spring Boot)
     * 
     * Without CORS:
     * Browser blocks requests from http://localhost:5173 to http://localhost:8080
     * 
     * With CORS:
     * Browser allows these cross-origin requests
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        /**
         * ALLOWED ORIGINS
         * Which domains can call our APIs
         * For development: http://localhost:5173, http://localhost:5174 (Vite React
         * app)
         * For production: Add your deployed frontend URL
         */
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",
                "http://localhost:5174"));

        /**
         * ALLOWED METHODS
         * Which HTTP methods are allowed
         */
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        /**
         * ALLOWED HEADERS
         * Which headers can be sent
         * "*" means all headers allowed
         */
        configuration.setAllowedHeaders(List.of("*"));

        /**
         * ALLOW CREDENTIALS
         * Allows sending cookies and authorization headers
         * Required for JWT tokens in Authorization header
         */
        configuration.setAllowCredentials(true);

        /**
         * MAX AGE
         * How long (in seconds) browser can cache CORS preflight response
         * 3600 = 1 hour
         */
        configuration.setMaxAge(3600L);

        /**
         * Apply CORS configuration to all URLs
         */
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}