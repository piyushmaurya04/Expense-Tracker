package com.Tracker.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.Tracker.Entity.Expense;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByUserId(Long userId);

    List<Expense> findByUserIdAndCategory(Long userId, String category);

    List<Expense> findByUserIdAndExpenseDateBetweenOrderByExpenseDateDesc(
            Long userId,
            LocalDate startDate,
            LocalDate endDate);

    List<Expense> findByUserIdAndAmountGreaterThanEqual(Long userId, BigDecimal amount);

    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId " +
            "AND e.expenseDate BETWEEN :startDate AND :endDate")
    List<Expense> findExpensesByUserAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.id = :userId")
    BigDecimal getTotalExpensesByUser(@Param("userId") Long userId);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.id = :userId " +
            "AND e.category = :category")
    BigDecimal getTotalExpensesByUserAndCategory(
            @Param("userId") Long userId,
            @Param("category") String category);

    List<Expense> findByUserIdOrderByExpenseDateDesc(Long userId);

    void deleteByUserId(Long userId);

    Long countByUserId(Long userId);

}
