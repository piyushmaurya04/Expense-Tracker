package com.Tracker.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.Tracker.Entity.Income;

public interface IncomeRepository extends JpaRepository<Income, Long> {
    List<Income> findByUserId(Long userId);

    List<Income> findByUserIdAndCategory(Long userId, String category);

    List<Income> findByUserIdAndIncomeDateBetweenOrderByIncomeDateDesc(
            Long userId,
            LocalDate startDate,
            LocalDate endDate);

    List<Income> findByUserIdAndAmountGreaterThanEqual(Long userId, BigDecimal amount);

    @Query("SELECT i FROM Income i WHERE i.user.id = :userId " +
            "AND i.incomeDate BETWEEN :startDate AND :endDate")
    List<Income> findIncomesByUserAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(i.amount) FROM Income i WHERE i.user.id = :userId")
    BigDecimal getTotalIncomesByUser(@Param("userId") Long userId);

    @Query("SELECT SUM(i.amount) FROM Income i WHERE i.user.id = :userId " +
            "AND i.category = :category")
    BigDecimal getTotalIncomesByUserAndCategory(
            @Param("userId") Long userId,
            @Param("category") String category);

    List<Income> findByUserIdOrderByIncomeDateDesc(Long userId);

    void deleteByUserId(Long userId);

    Long countByUserId(Long userId);

}
