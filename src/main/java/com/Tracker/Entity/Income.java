package com.Tracker.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * ENTITY: Maps to 'income' table
 */
@Entity
@Table(name = "income")
public class Income {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * @ManyToOne: Many incomes belong to one user
     * @JoinColumn: Creates foreign key column 'user_id'
     *              fetch = FetchType.LAZY: User data is only loaded when accessed
     *              (better performance)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "User is required")
    private User user;

    @NotBlank(message = "Title is required")
    @Column(nullable = false, length = 100)
    private String title;

    @Column(length = 50)
    private String category;

    /**
     * @Positive: Amount must be greater than zero
     *            BigDecimal: Used for precise decimal calculations (better than
     *            double for money)
     */
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    /**
     * LocalDate: Stores only date (no time)
     */
    @NotNull(message = "Income date is required")
    @Column(name = "income_date", nullable = false)
    private LocalDate incomeDate;

    /**
     * @Column: columnDefinition = "TEXT" for large text
     */
    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // ==================== CONSTRUCTORS ====================

    public Income() {
    }

    public Income(User user, String title, String category, BigDecimal amount,
            LocalDate incomeDate, String note) {
        this.user = user;
        this.title = title;
        this.category = category;
        this.amount = amount;
        this.incomeDate = incomeDate;
        this.note = note;
    }

    // ==================== GETTERS AND SETTERS ====================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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
}
