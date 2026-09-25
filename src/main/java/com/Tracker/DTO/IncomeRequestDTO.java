package com.Tracker.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO: Data sent from frontend to create/update income
 * Does NOT include userId - we get that from JWT token!
 * This ensures users can't create incomes for other users
 */
public class IncomeRequestDTO {

    @NotBlank(message = "Title is required")
    private String title;

    private String category; // Optional

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Income date is required")
    private LocalDate incomeDate;

    private String note; // Optional

    // ==================== CONSTRUCTORS ====================

    public IncomeRequestDTO() {
    }

    public IncomeRequestDTO(String title, String category, BigDecimal amount,
            LocalDate incomeDate, String note) {
        this.title = title;
        this.category = category;
        this.amount = amount;
        this.incomeDate = incomeDate;
        this.note = note;
    }

    // ==================== GETTERS AND SETTERS ====================

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
}
