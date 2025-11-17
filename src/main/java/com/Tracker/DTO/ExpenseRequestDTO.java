package com.Tracker.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO: Data sent from frontend to create/update expense
 * Does NOT include userId - we get that from JWT token!
 * This ensures users can't create expenses for other users
 */
public class ExpenseRequestDTO {

    @NotBlank(message = "Title is required")
    private String title;

    private String category; // Optional

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Expense date is required")
    private LocalDate expenseDate;

    private String note; // Optional

    // ==================== CONSTRUCTORS ====================

    public ExpenseRequestDTO() {
    }

    public ExpenseRequestDTO(String title, String category, BigDecimal amount,
            LocalDate expenseDate, String note) {
        this.title = title;
        this.category = category;
        this.amount = amount;
        this.expenseDate = expenseDate;
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
}