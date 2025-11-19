package com.Tracker.Controller;

import com.Tracker.DTO.ExpenseRequestDTO;
import com.Tracker.DTO.ExpenseResponseDTO;
import com.Tracker.Security.UserDetailsImpl;
import com.Tracker.Service.ExpenseService;
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
 * EXPENSE CONTROLLER
 * Handles all expense-related endpoints
 * 
 * ALL endpoints require authentication (JWT token)
 * User can ONLY access their own expenses
 * 
 * @RestController: Returns JSON responses
 * @RequestMapping: Base URL /api/expenses
 */
@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    /**
     * CREATE EXPENSE
     * POST /api/expenses
     * 
     * @AuthenticationPrincipal: Automatically gets logged-in user from JWT
     * 
     *                           CRITICAL: We get userId from JWT token (not from
     *                           request body)
     *                           This prevents users from creating expenses for
     *                           other users!
     * 
     *                           Request Header:
     *                           Authorization: Bearer eyJhbGc...
     * 
     *                           Request Body:
     *                           {
     *                           "title": "Groceries",
     *                           "category": "Food",
     *                           "amount": 50.00,
     *                           "expenseDate": "2025-10-13",
     *                           "note": "Weekly shopping"
     *                           }
     * 
     *                           Response: 201 Created
     *                           {
     *                           "id": 1,
     *                           "title": "Groceries",
     *                           "category": "Food",
     *                           "amount": 50.00,
     *                           "expenseDate": "2025-10-13",
     *                           "note": "Weekly shopping",
     *                           "createdAt": "2025-10-13T10:30:00",
     *                           "username": "john"
     *                           }
     */
    @PostMapping
    public ResponseEntity<ExpenseResponseDTO> createExpense(
            @Valid @RequestBody ExpenseRequestDTO expenseRequest,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        /**
         * Get userId from logged-in user (from JWT token)
         * NOT from request body!
         */
        Long userId = userDetails.getId();

        /**
         * Call service to create expense
         */
        ExpenseResponseDTO response = expenseService.createExpense(expenseRequest, userId);

        /**
         * Return 201 Created status with created expense
         */
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET ALL EXPENSES FOR LOGGED-IN USER
     * GET /api/expenses
     * 
     * Returns ONLY expenses belonging to logged-in user
     * 
     * Response: 200 OK
     * [
     * {
     * "id": 1,
     * "title": "Groceries",
     * "amount": 50.00,
     * ...
     * },
     * {
     * "id": 2,
     * "title": "Rent",
     * "amount": 1000.00,
     * ...
     * }
     * ]
     */
    @GetMapping
    public ResponseEntity<List<ExpenseResponseDTO>> getAllExpenses(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        /**
         * Get userId from JWT token
         */
        Long userId = userDetails.getId();

        /**
         * Get only this user's expenses
         */
        List<ExpenseResponseDTO> expenses = expenseService.getAllExpensesByUser(userId);

        return ResponseEntity.ok(expenses);
    }

    /**
     * GET EXPENSE BY ID
     * GET /api/expenses/{id}
     * 
     * @PathVariable: Extracts {id} from URL path
     * 
     *                Example: GET /api/expenses/5
     * 
     *                SECURITY: Verifies expense belongs to logged-in user
     *                If not, returns 403 Forbidden or 404 Not Found
     * 
     *                Response: 200 OK
     *                {
     *                "id": 5,
     *                "title": "Coffee",
     *                ...
     *                }
     */
    @GetMapping("/{id}")
    public ResponseEntity<ExpenseResponseDTO> getExpenseById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Long userId = userDetails.getId();

        /**
         * Service will verify expense belongs to user
         * If not, throws exception (handled by exception handler)
         */
        ExpenseResponseDTO expense = expenseService.getExpenseById(id, userId);

        return ResponseEntity.ok(expense);
    }

    /**
     * UPDATE EXPENSE
     * PUT /api/expenses/{id}
     * 
     * Example: PUT /api/expenses/5
     * 
     * Request Body:
     * {
     * "title": "Updated Title",
     * "amount": 75.00,
     * ...
     * }
     * 
     * SECURITY: Verifies expense belongs to logged-in user
     * 
     * Response: 200 OK with updated expense
     */
    @PutMapping("/{id}")
    public ResponseEntity<ExpenseResponseDTO> updateExpense(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequestDTO expenseRequest,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Long userId = userDetails.getId();

        /**
         * Service will verify ownership and update
         */
        ExpenseResponseDTO updatedExpense = expenseService.updateExpense(id, expenseRequest, userId);

        return ResponseEntity.ok(updatedExpense);
    }

    /**
     * DELETE EXPENSE
     * DELETE /api/expenses/{id}
     * 
     * Example: DELETE /api/expenses/5
     * 
     * SECURITY: Verifies expense belongs to logged-in user
     * 
     * Response: 204 No Content (success, no body)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Long userId = userDetails.getId();

        /**
         * Service will verify ownership and delete
         */
        expenseService.deleteExpense(id, userId);

        /**
         * Return 204 No Content (successful deletion)
         */
        return ResponseEntity.noContent().build();
    }

    /**
     * GET EXPENSES BY CATEGORY
     * GET /api/expenses/category/{category}
     * 
     * Example: GET /api/expenses/category/Food
     * 
     * Response: List of expenses in that category (only for logged-in user)
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<ExpenseResponseDTO>> getExpensesByCategory(
            @PathVariable String category,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Long userId = userDetails.getId();

        List<ExpenseResponseDTO> expenses = expenseService.getExpensesByCategory(userId, category);

        return ResponseEntity.ok(expenses);
    }

    /**
     * GET EXPENSES BY DATE RANGE
     * GET /api/expenses/date-range
     * 
     * @RequestParam: Extracts query parameters from URL
     * 
     *                Example: GET
     *                /api/expenses/date-range?startDate=2025-10-01&endDate=2025-10-31
     * 
     * @DateTimeFormat: Converts string "2025-10-01" to LocalDate
     * 
     *                  Response: List of expenses within date range
     */
    @GetMapping("/date-range")
    public ResponseEntity<List<ExpenseResponseDTO>> getExpensesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Long userId = userDetails.getId();

        List<ExpenseResponseDTO> expenses = expenseService.getExpensesByDateRange(userId, startDate, endDate);

        return ResponseEntity.ok(expenses);
    }

    /**
     * GET TOTAL EXPENSES
     * GET /api/expenses/total
     * 
     * Returns sum of all expenses for logged-in user
     * 
     * Response: 200 OK
     * {
     * "total": 1500.50
     * }
     */
    @GetMapping("/total")
    public ResponseEntity<Map<String, BigDecimal>> getTotalExpenses(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Long userId = userDetails.getId();

        BigDecimal totalAmount = expenseService.getTotalExpenses(userId);

        /**
         * Return as JSON object
         */
        Map<String, BigDecimal> response = new HashMap<>();
        response.put("total", totalAmount);
        return ResponseEntity.ok(response);
    }

    /**
     * GET TOTAL EXPENSES BY CATEGORY
     * GET /api/expenses/total/category/{category}
     * 
     * Example: GET /api/expenses/total/category/Food
     * 
     * Response:
     * {
     * "category": "Food",
     * "total": 350.75
     * }
     */
    @GetMapping("/total/category/{category}")
    public ResponseEntity<Map<String, Object>> getTotalExpensesByCategory(
            @PathVariable String category,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Long userId = userDetails.getId();

        BigDecimal totalAmount = expenseService.getTotalExpensesByCategory(userId, category);

        Map<String, Object> response = new HashMap<>();
        response.put("category", category);
        response.put("total", totalAmount);
        return ResponseEntity.ok(response);
    }

    /**
     * GET EXPENSE COUNT
     * GET /api/expenses/count
     * 
     * Returns number of expenses for logged-in user
     * 
     * Response:
     * {
     * "count": 25
     * }
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getExpenseCount(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Long userId = userDetails.getId();

        Long expenseCount = expenseService.getExpenseCount(userId);

        Map<String, Long> response = new HashMap<>();
        response.put("count", expenseCount);
        return ResponseEntity.ok(response);
    }
}