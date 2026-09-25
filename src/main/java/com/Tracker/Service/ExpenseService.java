package com.Tracker.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.Tracker.DTO.ExpenseRequestDTO;
import com.Tracker.DTO.ExpenseResponseDTO;
import com.Tracker.Entity.Expense;
import com.Tracker.Entity.User;
import com.Tracker.Repository.ExpenseRepository;
import com.Tracker.Repository.UserRepository;

import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * EXPENSE SERVICE
 * Handles all expense-related business logic with SESSION ISOLATION
 * 
 * @Service: Marks this as service component
 */
@Service
public class ExpenseService {
    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * CREATE EXPENSE
     * Creates new expense for logged-in user
     * 
     * @param ExpenseRequestDTO: Expense data from frontend
     * @param userId:         ID of logged-in user (from JWT token)
     * @return ExpenseResponseDTO
     */
    @Transactional
    public ExpenseResponseDTO createExpense(ExpenseRequestDTO ExpenseRequestDTO, Long userId) {
        /**
         * STEP 1: Find user
         * We verify user exists before creating expense
         */
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        /**
         * STEP 2: Create expense entity
         * Convert DTO (from frontend) to Entity (for database)
         */
        Expense expense = new Expense();
        expense.setUser(user); // CRITICAL: Set user - links expense to this user only!
        expense.setTitle(ExpenseRequestDTO.getTitle());
        expense.setCategory(ExpenseRequestDTO.getCategory());
        expense.setAmount(ExpenseRequestDTO.getAmount());
        expense.setExpenseDate(ExpenseRequestDTO.getExpenseDate());
        expense.setNote(ExpenseRequestDTO.getNote());

        /**
         * STEP 3: Save to database
         */
        Expense savedExpense = expenseRepository.save(expense);

        /**
         * STEP 4: Convert Entity back to DTO
         * We don't send Entity directly to frontend
         */
        return convertToDTO(savedExpense);
    }

    /**
     * GET ALL EXPENSES FOR USER
     * Returns ONLY expenses belonging to logged-in user
     * 
     * SESSION ISOLATION: User A cannot see User B's expenses!
     * 
     * @param userId: ID of logged-in user
     * @return List of ExpenseResponseDTO
     */
    public List<ExpenseResponseDTO> getAllExpensesByUser(Long userId) {
        /**
         * Find expenses where user_id = userId
         * This SQL: SELECT * FROM expence WHERE user_id = ?
         */
        List<Expense> expenses = expenseRepository.findByUserId(userId);

        /**
         * Convert list of Entities to list of DTOs
         */
        return expenses.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * GET EXPENSE BY ID
     * Returns expense ONLY if it belongs to logged-in user
     * 
     * SESSION ISOLATION: Even if user knows expense ID,
     * they can't access it if it belongs to another user!
     * 
     * @param expenseId: Expense ID
     * @param userId:    ID of logged-in user
     * @return ExpenseResponseDTO
     */
    public ExpenseResponseDTO getExpenseById(Long expenseId, Long userId) {
        /**
         * STEP 1: Find expense by ID
         */
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found with id: " + expenseId));

        /**
         * STEP 2: CRITICAL SECURITY CHECK!
         * Verify expense belongs to logged-in user
         */
        if (!expense.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You don't have permission to access this expense");
        }

        /**
         * STEP 3: Return DTO
         */
        return convertToDTO(expense);
    }

    /**
     * UPDATE EXPENSE
     * Updates expense ONLY if it belongs to logged-in user
     * 
     * @param expenseId:      Expense ID to update
     * @param ExpenseRequestDTO: New expense data
     * @param userId:         ID of logged-in user
     * @return ExpenseResponseDTO
     */
    @Transactional
    public ExpenseResponseDTO updateExpense(Long expenseId, ExpenseRequestDTO ExpenseRequestDTO, Long userId) {
        /**
         * STEP 1: Find expense
         */
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found with id: " + expenseId));

        /**
         * STEP 2: CRITICAL SECURITY CHECK!
         * Verify expense belongs to logged-in user
         */
        if (!expense.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You don't have permission to update this expense");
        }

        /**
         * STEP 3: Update expense fields
         */
        expense.setTitle(ExpenseRequestDTO.getTitle());
        expense.setCategory(ExpenseRequestDTO.getCategory());
        expense.setAmount(ExpenseRequestDTO.getAmount());
        expense.setExpenseDate(ExpenseRequestDTO.getExpenseDate());
        expense.setNote(ExpenseRequestDTO.getNote());

        /**
         * STEP 4: Save changes
         */
        Expense updatedExpense = expenseRepository.save(expense);

        return convertToDTO(updatedExpense);
    }

    /**
     * DELETE EXPENSE
     * Deletes expense ONLY if it belongs to logged-in user
     * 
     * @param expenseId: Expense ID to delete
     * @param userId:    ID of logged-in user
     */
    @Transactional
    public void deleteExpense(Long expenseId, Long userId) {
        /**
         * STEP 1: Find expense
         */
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found with id: " + expenseId));

        /**
         * STEP 2: CRITICAL SECURITY CHECK!
         * Verify expense belongs to logged-in user
         */
        if (!expense.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You don't have permission to delete this expense");
        }

        /**
         * STEP 3: Delete expense
         */
        expenseRepository.delete(expense);
    }

    /**
     * GET EXPENSES BY CATEGORY
     * Returns expenses for specific category (only for logged-in user)
     */
    public List<ExpenseResponseDTO> getExpensesByCategory(Long userId, String category) {
        List<Expense> expenses = expenseRepository.findByUserIdAndCategory(userId, category);

        return expenses.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * GET EXPENSES BY DATE RANGE
     * Returns expenses within date range (only for logged-in user)
     */
    public List<ExpenseResponseDTO> getExpensesByDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        List<Expense> expenses = expenseRepository
                .findByUserIdAndExpenseDateBetweenOrderByExpenseDateDesc(userId, startDate, endDate);

        return expenses.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * GET TOTAL EXPENSES
     * Calculates total amount spent by logged-in user
     */
    public BigDecimal getTotalExpenses(Long userId) {
        BigDecimal total = expenseRepository.getTotalExpensesByUser(userId);
        return total != null ? total : BigDecimal.ZERO;
    }

    /**
     * GET TOTAL EXPENSES BY CATEGORY
     * Calculates total amount spent in specific category
     */
    public BigDecimal getTotalExpensesByCategory(Long userId, String category) {
        BigDecimal total = expenseRepository.getTotalExpensesByUserAndCategory(userId, category);
        return total != null ? total : BigDecimal.ZERO;
    }

    /**
     * GET EXPENSE COUNT
     * Returns number of expenses for logged-in user
     */
    public Long getExpenseCount(Long userId) {
        return expenseRepository.countByUserId(userId);
    }

    /**
     * CONVERT ENTITY TO DTO
     * Private helper method to convert Expense entity to ExpenseResponseDTO DTO
     * 
     * @param expense: Expense entity
     * @return ExpenseResponseDTO DTO
     */
    private ExpenseResponseDTO convertToDTO(Expense expense) {
        ExpenseResponseDTO response = new ExpenseResponseDTO();
        response.setId(expense.getId());
        response.setTitle(expense.getTitle());
        response.setCategory(expense.getCategory());
        response.setAmount(expense.getAmount());
        response.setExpenseDate(expense.getExpenseDate());
        response.setNote(expense.getNote());
        response.setCreatedAt(expense.getCreatedAt());
        response.setUsername(expense.getUser().getUsername());

        return response;
    }
}
