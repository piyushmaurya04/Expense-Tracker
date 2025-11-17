package com.Tracker.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.Tracker.DTO.IncomeRequestDTO;
import com.Tracker.DTO.IncomeResponseDTO;
import com.Tracker.Entity.Income;
import com.Tracker.Entity.User;
import com.Tracker.Repository.IncomeRepository;
import com.Tracker.Repository.UserRepository;

import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * INCOME SERVICE
 * Handles all income-related business logic with SESSION ISOLATION
 * 
 * @Service: Marks this as service component
 */
@Service
public class IncomeService {
    @Autowired
    private IncomeRepository incomeRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * CREATE INCOME
     * Creates new income for logged-in user
     * 
     * @param IncomeRequestDTO: Income data from frontend
     * @param userId:           ID of logged-in user (from JWT token)
     * @return IncomeResponseDTO
     */
    @Transactional
    public IncomeResponseDTO createIncome(IncomeRequestDTO IncomeRequestDTO, Long userId) {
        /**
         * STEP 1: Find user
         * We verify user exists before creating income
         */
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        /**
         * STEP 2: Create income entity
         * Convert DTO (from frontend) to Entity (for database)
         */
        Income income = new Income();
        income.setUser(user); // CRITICAL: Set user - links income to this user only!
        income.setTitle(IncomeRequestDTO.getTitle());
        income.setCategory(IncomeRequestDTO.getCategory());
        income.setAmount(IncomeRequestDTO.getAmount());
        income.setIncomeDate(IncomeRequestDTO.getIncomeDate());
        income.setNote(IncomeRequestDTO.getNote());

        /**
         * STEP 3: Save to database
         */
        Income savedIncome = incomeRepository.save(income);

        /**
         * STEP 4: Convert Entity back to DTO
         * We don't send Entity directly to frontend
         */
        return convertToDTO(savedIncome);
    }

    /**
     * GET ALL INCOMES FOR USER
     * Returns ONLY incomes belonging to logged-in user
     * 
     * SESSION ISOLATION: User A cannot see User B's incomes!
     * 
     * @param userId: ID of logged-in user
     * @return List of IncomeResponseDTO
     */
    public List<IncomeResponseDTO> getAllIncomesByUser(Long userId) {
        /**
         * Find incomes where user_id = userId
         * This SQL: SELECT * FROM income WHERE user_id = ?
         */
        List<Income> incomes = incomeRepository.findByUserId(userId);

        /**
         * Convert list of Entities to list of DTOs
         */
        return incomes.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * GET INCOME BY ID
     * Returns income ONLY if it belongs to logged-in user
     * 
     * SESSION ISOLATION: Even if user knows income ID,
     * they can't access it if it belongs to another user!
     * 
     * @param incomeId: Income ID
     * @param userId:   ID of logged-in user
     * @return IncomeResponseDTO
     */
    public IncomeResponseDTO getIncomeById(Long incomeId, Long userId) {
        /**
         * STEP 1: Find income by ID
         */
        Income income = incomeRepository.findById(incomeId)
                .orElseThrow(() -> new RuntimeException("Income not found with id: " + incomeId));

        /**
         * STEP 2: CRITICAL SECURITY CHECK!
         * Verify income belongs to logged-in user
         */
        if (!income.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You don't have permission to access this income");
        }

        /**
         * STEP 3: Return DTO
         */
        return convertToDTO(income);
    }

    /**
     * UPDATE INCOME
     * Updates income ONLY if it belongs to logged-in user
     * 
     * @param incomeId:         Income ID to update
     * @param IncomeRequestDTO: New income data
     * @param userId:           ID of logged-in user
     * @return IncomeResponseDTO
     */
    @Transactional
    public IncomeResponseDTO updateIncome(Long incomeId, IncomeRequestDTO IncomeRequestDTO, Long userId) {
        /**
         * STEP 1: Find income
         */
        Income income = incomeRepository.findById(incomeId)
                .orElseThrow(() -> new RuntimeException("Income not found with id: " + incomeId));

        /**
         * STEP 2: CRITICAL SECURITY CHECK!
         * Verify income belongs to logged-in user
         */
        if (!income.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You don't have permission to update this income");
        }

        /**
         * STEP 3: Update income fields
         */
        income.setTitle(IncomeRequestDTO.getTitle());
        income.setCategory(IncomeRequestDTO.getCategory());
        income.setAmount(IncomeRequestDTO.getAmount());
        income.setIncomeDate(IncomeRequestDTO.getIncomeDate());
        income.setNote(IncomeRequestDTO.getNote());

        /**
         * STEP 4: Save changes
         */
        Income updatedIncome = incomeRepository.save(income);

        return convertToDTO(updatedIncome);
    }

    /**
     * DELETE INCOME
     * Deletes income ONLY if it belongs to logged-in user
     * 
     * @param incomeId: Income ID to delete
     * @param userId:   ID of logged-in user
     */
    @Transactional
    public void deleteIncome(Long incomeId, Long userId) {
        /**
         * STEP 1: Find income
         */
        Income income = incomeRepository.findById(incomeId)
                .orElseThrow(() -> new RuntimeException("Income not found with id: " + incomeId));

        /**
         * STEP 2: CRITICAL SECURITY CHECK!
         * Verify income belongs to logged-in user
         */
        if (!income.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You don't have permission to delete this income");
        }

        /**
         * STEP 3: Delete income
         */
        incomeRepository.delete(income);
    }

    /**
     * GET INCOMES BY CATEGORY
     * Returns incomes for specific category (only for logged-in user)
     */
    public List<IncomeResponseDTO> getIncomesByCategory(Long userId, String category) {
        List<Income> incomes = incomeRepository.findByUserIdAndCategory(userId, category);

        return incomes.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * GET INCOMES BY DATE RANGE
     * Returns incomes within date range (only for logged-in user)
     */
    public List<IncomeResponseDTO> getIncomesByDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        List<Income> incomes = incomeRepository
                .findByUserIdAndIncomeDateBetweenOrderByIncomeDateDesc(userId, startDate, endDate);

        return incomes.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * GET TOTAL INCOMES
     * Calculates total amount earned by logged-in user
     */
    public BigDecimal getTotalIncomes(Long userId) {
        BigDecimal total = incomeRepository.getTotalIncomesByUser(userId);
        return total != null ? total : BigDecimal.ZERO;
    }

    /**
     * GET TOTAL INCOMES BY CATEGORY
     * Calculates total amount earned in specific category
     */
    public BigDecimal getTotalIncomesByCategory(Long userId, String category) {
        BigDecimal total = incomeRepository.getTotalIncomesByUserAndCategory(userId, category);
        return total != null ? total : BigDecimal.ZERO;
    }

    /**
     * GET INCOME COUNT
     * Returns number of incomes for logged-in user
     */
    public Long getIncomeCount(Long userId) {
        return incomeRepository.countByUserId(userId);
    }

    /**
     * CONVERT ENTITY TO DTO
     * Private helper method to convert Income entity to IncomeResponseDTO DTO
     * 
     * @param income: Income entity
     * @return IncomeResponseDTO DTO
     */
    private IncomeResponseDTO convertToDTO(Income income) {
        IncomeResponseDTO response = new IncomeResponseDTO();
        response.setId(income.getId());
        response.setTitle(income.getTitle());
        response.setCategory(income.getCategory());
        response.setAmount(income.getAmount());
        response.setIncomeDate(income.getIncomeDate());
        response.setNote(income.getNote());
        response.setCreatedAt(income.getCreatedAt());
        response.setUsername(income.getUser().getUsername());

        return response;
    }
}
