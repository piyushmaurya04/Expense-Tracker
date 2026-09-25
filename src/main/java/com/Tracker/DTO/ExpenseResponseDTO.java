package com.Tracker.DTO;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ExpenseResponseDTO {
    private Long id;
    private String title;
    private String category;
    private BigDecimal amount;
    private LocalDate expenseDate;
    private String note;
    private LocalDateTime createdAt;

    /**
     * We include username instead of full User object
     * Frontend doesn't need user's email or password
     */
    private String username;

    // ==================== CONSTRUCTORS ====================

    public ExpenseResponseDTO() {
    }

    public ExpenseResponseDTO(Long id, String title, String category, BigDecimal amount,
            LocalDate expenseDate, String note, LocalDateTime createdAt,
            String username) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.amount = amount;
        this.expenseDate = expenseDate;
        this.note = note;
        this.createdAt = createdAt;
        this.username = username;
    }

    // ==================== GETTERS AND SETTERS ====================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getExpenseDate() {
        return expenseDate;
    }

    public void setExpenseDate(LocalDate expenseDate) {
        this.expenseDate = expenseDate;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
