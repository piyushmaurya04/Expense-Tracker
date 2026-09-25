package com.Tracker.Controller;

import com.Tracker.DTO.IncomeRequestDTO;
import com.Tracker.DTO.IncomeResponseDTO;
import com.Tracker.Security.UserDetailsImpl;
import com.Tracker.Service.IncomeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * INCOME CONTROLLER
 * Handles all income-related endpoints
 * 
 * ALL endpoints require authentication (JWT token)
 * User can ONLY access their own incomes
 * 
 * @RestController: Returns JSON responses
 * @RequestMapping: Base URL /api/incomes
 */
@RestController
@RequestMapping("/api/incomes")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class IncomeController {

    @Autowired
    private IncomeService incomeService;

    /**
     * CREATE INCOME
     * POST /api/incomes
     * 
     * @AuthenticationPrincipal: Automatically gets logged-in user from JWT
     * 
     *                           CRITICAL: We get userId from JWT token (not from
     *                           request body)
     *                           This prevents users from creating incomes for
     *                           other users!
     * 
     *                           Request Header:
     *                           Authorization: Bearer eyJhbGc...
     * 
     *                           Request Body:
     *                           {
     *                           "title": "Salary",
     *                           "category": "Job",
     *                           "amount": 5000.00,
     *                           "incomeDate": "2025-10-13",
     *                           "note": "Monthly salary"
     *                           }
     * 
     *                           Response: 201 Created
     *                           {
     *                           "id": 1,
     *                           "title": "Salary",
     *                           "category": "Job",
     *                           "amount": 5000.00,
     *                           "incomeDate": "2025-10-13",
     *                           "note": "Monthly salary",
     *                           "createdAt": "2025-10-13T10:30:00",
     *                           "username": "john"
     *                           }
     */
    @PostMapping
    public ResponseEntity<IncomeResponseDTO> createIncome(
            @Valid @RequestBody IncomeRequestDTO incomeRequest,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        /**
         * Get userId from logged-in user (from JWT token)
         * NOT from request body!
         */
        Long userId = userDetails.getId();

        /**
         * Call service to create income
         */
        IncomeResponseDTO response = incomeService.createIncome(incomeRequest, userId);

        /**
         * Return 201 Created status with created income
         */
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET ALL INCOMES FOR LOGGED-IN USER
     * GET /api/incomes
     * 
     * Returns ONLY incomes belonging to logged-in user
     * 
     * Response: 200 OK
     * [
     * {
     * "id": 1,
     * "title": "Salary",
     * "amount": 5000.00,
     * ...
     * },
     * {
     * "id": 2,
     * "title": "Freelance",
     * "amount": 1000.00,
     * ...
     * }
     * ]
     */
    @GetMapping
    public ResponseEntity<List<IncomeResponseDTO>> getAllIncomes(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        /**
         * Get userId from JWT token
         */
        Long userId = userDetails.getId();

        /**
         * Get only this user's incomes
         */
        List<IncomeResponseDTO> incomes = incomeService.getAllIncomesByUser(userId);

        return ResponseEntity.ok(incomes);
    }

    /**
     * GET INCOME BY ID
     * GET /api/incomes/{id}
     * 
     * @PathVariable: Extracts {id} from URL path
     * 
     *                Example: GET /api/incomes/5
     * 
     *                SECURITY: Verifies income belongs to logged-in user
     *                If not, returns 403 Forbidden or 404 Not Found
     * 
     *                Response: 200 OK
     *                {
     *                "id": 5,
     *                "title": "Bonus",
     *                ...
     *                }
     */
    @GetMapping("/{id}")
    public ResponseEntity<IncomeResponseDTO> getIncomeById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Long userId = userDetails.getId();

        /**
         * Service will verify income belongs to user
         * If not, throws exception (handled by exception handler)
         */
        IncomeResponseDTO income = incomeService.getIncomeById(id, userId);

        return ResponseEntity.ok(income);
    }

    /**
     * UPDATE INCOME
     * PUT /api/incomes/{id}
     * 
     * Example: PUT /api/incomes/5
     * 
     * Request Body:
     * {
     * "title": "Updated Title",
     * "amount": 5500.00,
     * ...
     * }
     * 
     * SECURITY: Verifies income belongs to logged-in user
     * 
     * Response: 200 OK with updated income
     */
    @PutMapping("/{id}")
    public ResponseEntity<IncomeResponseDTO> updateIncome(
            @PathVariable Long id,
            @Valid @RequestBody IncomeRequestDTO incomeRequest,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Long userId = userDetails.getId();

        /**
         * Service will verify ownership and update
         */
        IncomeResponseDTO updatedIncome = incomeService.updateIncome(id, incomeRequest, userId);

        return ResponseEntity.ok(updatedIncome);
    }

    /**
     * DELETE INCOME
     * DELETE /api/incomes/{id}
     * 
     * Example: DELETE /api/incomes/5
     * 
     * SECURITY: Verifies income belongs to logged-in user
     * 
     * Response: 204 No Content (success, no body)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncome(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Long userId = userDetails.getId();

        /**
         * Service will verify ownership and delete
         */
        incomeService.deleteIncome(id, userId);

        /**
         * Return 204 No Content (successful deletion)
         */
        return ResponseEntity.noContent().build();
    }

    /**
     * GET INCOMES BY CATEGORY
     * GET /api/incomes/category/{category}
     * 
     * Example: GET /api/incomes/category/Salary
     * 
     * Response: List of incomes in that category (only for logged-in user)
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<IncomeResponseDTO>> getIncomesByCategory(
            @PathVariable String category,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Long userId = userDetails.getId();

        List<IncomeResponseDTO> incomes = incomeService.getIncomesByCategory(userId, category);

        return ResponseEntity.ok(incomes);
    }

    /**
     * GET INCOMES BY DATE RANGE
     * GET /api/incomes/date-range
     * 
     * @RequestParam: Extracts query parameters from URL
     * 
     *                Example: GET
     *                /api/incomes/date-range?startDate=2025-10-01&endDate=2025-10-31
     * 
     * @DateTimeFormat: Converts string "2025-10-01" to LocalDate
     * 
     *                  Response: List of incomes within date range
     */
    @GetMapping("/date-range")
    public ResponseEntity<List<IncomeResponseDTO>> getIncomesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Long userId = userDetails.getId();

        List<IncomeResponseDTO> incomes = incomeService.getIncomesByDateRange(userId, startDate, endDate);

        return ResponseEntity.ok(incomes);
    }

    /**
     * GET TOTAL INCOMES
     * GET /api/incomes/total
     * 
     * Returns sum of all incomes for logged-in user
     * 
     * Response: 200 OK
     * {
     * "total": 15000.50
     * }
     */
    @GetMapping("/total")
    public ResponseEntity<Map<String, BigDecimal>> getTotalIncomes(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Long userId = userDetails.getId();

        BigDecimal totalAmount = incomeService.getTotalIncomes(userId);

        /**
         * Return as JSON object
         */
        Map<String, BigDecimal> response = new HashMap<>();
        response.put("total", totalAmount);
        return ResponseEntity.ok(response);
    }

    /**
     * GET TOTAL INCOMES BY CATEGORY
     * GET /api/incomes/total/category/{category}
     * 
     * Example: GET /api/incomes/total/category/Salary
     * 
     * Response:
     * {
     * "category": "Salary",
     * "total": 12000.00
     * }
     */
    @GetMapping("/total/category/{category}")
    public ResponseEntity<Map<String, Object>> getTotalIncomesByCategory(
            @PathVariable String category,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Long userId = userDetails.getId();

        BigDecimal totalAmount = incomeService.getTotalIncomesByCategory(userId, category);

        Map<String, Object> response = new HashMap<>();
        response.put("category", category);
        response.put("total", totalAmount);
        return ResponseEntity.ok(response);
    }

    /**
     * GET INCOME COUNT
     * GET /api/incomes/count
     * 
     * Returns number of incomes for logged-in user
     * 
     * Response:
     * {
     * "count": 15
     * }
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getIncomeCount(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Long userId = userDetails.getId();

        Long incomeCount = incomeService.getIncomeCount(userId);

        Map<String, Long> response = new HashMap<>();
        response.put("count", incomeCount);
        return ResponseEntity.ok(response);
    }
}
