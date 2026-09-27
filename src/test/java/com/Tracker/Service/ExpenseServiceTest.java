package com.Tracker.Service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.Tracker.DTO.ExpenseRequestDTO;
import com.Tracker.DTO.ExpenseResponseDTO;
import com.Tracker.Entity.Expense;
import com.Tracker.Entity.User;
import com.Tracker.Repository.ExpenseRepository;
import com.Tracker.Repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ExpenseService expenseService;

    @Test
    void createExpense_shouldSaveAndReturnDto() {
        User user = new User("alice", "alice@email.com", "encoded-password");
        user.setId(1L);
        ExpenseRequestDTO request = new ExpenseRequestDTO("Groceries", "Food", new BigDecimal("52.50"),
                LocalDate.of(2026, 9, 22), "Weekly shopping");
        Expense expense = new Expense(user, "Groceries", "Food", new BigDecimal("52.50"),
                LocalDate.of(2026, 9, 22), "Weekly shopping");
        expense.setId(10L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(expenseRepository.save(any(Expense.class))).thenReturn(expense);

        ExpenseResponseDTO result = expenseService.createExpense(request, 1L);

        assertEquals("Groceries", result.getTitle());
        assertEquals("alice", result.getUsername());
        verify(expenseRepository).save(any(Expense.class));
    }

    @Test
    void getAllExpensesByUser_shouldReturnDtoList() {
        User user = new User("alice", "alice@email.com", "encoded-password");
        user.setId(1L);
        Expense expense = new Expense(user, "Lunch", "Food", new BigDecimal("18.00"), LocalDate.of(2026, 9, 23),
                "Cafe");
        expense.setId(2L);

        when(expenseRepository.findByUserId(1L)).thenReturn(List.of(expense));

        List<ExpenseResponseDTO> result = expenseService.getAllExpensesByUser(1L);

        assertEquals(1, result.size());
        assertEquals("Lunch", result.get(0).getTitle());
    }

    @Test
    void getExpenseById_whenOwnedByUser_shouldReturnExpense() {
        User user = new User("alice", "alice@email.com", "encoded-password");
        user.setId(1L);
        Expense expense = new Expense(user, "Lunch", "Food", new BigDecimal("18.00"), LocalDate.of(2026, 9, 23),
                "Cafe");
        expense.setId(2L);

        when(expenseRepository.findById(2L)).thenReturn(Optional.of(expense));

        ExpenseResponseDTO result = expenseService.getExpenseById(2L, 1L);

        assertEquals("Lunch", result.getTitle());
        assertEquals("alice", result.getUsername());
    }

    @Test
    void getExpenseById_whenAnotherUserOwnsExpense_shouldThrow() {
        User owner = new User("alice", "alice@email.com", "encoded-password");
        owner.setId(1L);
        User otherUser = new User("bob", "bob@email.com", "encoded-password");
        otherUser.setId(2L);
        Expense expense = new Expense(owner, "Lunch", "Food", new BigDecimal("18.00"), LocalDate.of(2026, 9, 23),
                "Cafe");
        expense.setId(2L);

        when(expenseRepository.findById(2L)).thenReturn(Optional.of(expense));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> expenseService.getExpenseById(2L, 99L));
        assertEquals("Unauthorized: You don't have permission to access this expense", exception.getMessage());
    }

    @Test
    void updateExpense_shouldUpdateFieldsAndReturnDto() {
        User user = new User("alice", "alice@email.com", "encoded-password");
        user.setId(1L);
        Expense expense = new Expense(user, "Old", "Food", new BigDecimal("15.00"), LocalDate.of(2026, 9, 10),
                "Old note");
        expense.setId(5L);
        ExpenseRequestDTO request = new ExpenseRequestDTO("New title", "Travel", new BigDecimal("25.00"),
                LocalDate.of(2026, 9, 14), "New note");

        when(expenseRepository.findById(5L)).thenReturn(Optional.of(expense));
        when(expenseRepository.save(any(Expense.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ExpenseResponseDTO result = expenseService.updateExpense(5L, request, 1L);

        assertEquals("New title", result.getTitle());
        assertEquals("Travel", result.getCategory());
        assertEquals(new BigDecimal("25.00"), result.getAmount());
    }

    @Test
    void deleteExpense_shouldRemoveOwnedExpense() {
        User user = new User("alice", "alice@email.com", "encoded-password");
        user.setId(1L);
        Expense expense = new Expense(user, "Lunch", "Food", new BigDecimal("18.00"), LocalDate.of(2026, 9, 23),
                "Cafe");
        expense.setId(7L);

        when(expenseRepository.findById(7L)).thenReturn(Optional.of(expense));

        expenseService.deleteExpense(7L, 1L);

        verify(expenseRepository).delete(expense);
    }

    @Test
    void getTotalExpenses_shouldReturnZeroWhenNull() {
        when(expenseRepository.getTotalExpensesByUser(1L)).thenReturn(null);

        BigDecimal total = expenseService.getTotalExpenses(1L);

        assertEquals(BigDecimal.ZERO, total);
    }
}
