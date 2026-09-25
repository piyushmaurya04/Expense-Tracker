package com.Tracker.DTO;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class IncomeResponseDTO {
    private Long id;
    private String title;
    private String category;
    private BigDecimal amount;
    private LocalDate incomeDate;
    private String note;
    private LocalDateTime createdAt;

    /**
     * We include username instead of full User object
     * Frontend doesn't need user's email or password
     */
    private String username;

    // ==================== CONSTRUCTORS ====================

    public IncomeResponseDTO() {
    }

    public IncomeResponseDTO(Long id, String title, String category, BigDecimal amount,
            LocalDate incomeDate, String note, LocalDateTime createdAt,
            String username) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.amount = amount;
        this.incomeDate = incomeDate;
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

    public LocalDate getIncomeDate() {
        return incomeDate;
    }

    public void setIncomeDate(LocalDate incomeDate) {
        this.incomeDate = incomeDate;
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
