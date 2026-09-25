package com.Tracker.Security;
import com.Tracker.Entity.User;
import com.Tracker.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * USER DETAILS SERVICE IMPLEMENTATION
 * Spring Security calls this service to load user from database
 * 
 * @Service: Marks this as a service component (business logic layer)
 *           UserDetailsService: Spring Security interface we must implement
 */
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    /**
     * @Autowired: Automatically injects UserRepository
     *             Spring creates UserRepository implementation and gives it to us
     */
    @Autowired
    private UserRepository userRepository;

    /**
     * LOAD USER BY USERNAME
     * This method is called by Spring Security during:
     * 1. Login - to verify password
     * 2. Every request - to validate JWT token
     * 
     * @Transactional: Ensures database operations are atomic
     *                 (all succeed or all fail - no partial updates)
     * 
     * @param username: Username to search for
     * @return UserDetails object containing user info
     * @throws UsernameNotFoundException if user doesn't exist
     */
    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        /**
         * STEP 1: Find user in database by username
         * findByUsername returns Optional<User>
         * orElseThrow: If user not found, throw exception
         */
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with username: " + username));

        /**
         * STEP 2: Convert User entity to UserDetailsImpl
         * Spring Security doesn't work with our User entity directly
         * It needs UserDetails interface implementation
         */
        return UserDetailsImpl.build(user);
    }
}