package com.Tracker.Expense;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * Main Application Class
 * 
 * @SpringBootApplication: Combines @Configuration, @EnableAutoConfiguration, @ComponentScan
 * @ComponentScan: Tells Spring to scan "com.Tracker" package and all
 *                 sub-packages
 *                 This ensures SecurityConfig, Controllers, Services, etc. are
 *                 found
 * @EnableJpaRepositories: Tells Spring Data JPA to scan for repository
 *                         interfaces
 *                         in the specified package (com.Tracker.Repository)
 * @EntityScan: Tells JPA to scan for entity classes (@Entity) in the specified
 *              package
 */
@SpringBootApplication
@ComponentScan(basePackages = "com.Tracker")
@EnableJpaRepositories(basePackages = "com.Tracker.Repository")
@EntityScan(basePackages = "com.Tracker.Entity")
public class ExpenseApplication {

	public static void main(String[] args) {
		SpringApplication.run(ExpenseApplication.class, args);
	}

}
