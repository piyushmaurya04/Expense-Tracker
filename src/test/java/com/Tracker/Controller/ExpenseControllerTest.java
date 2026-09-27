package com.Tracker.Controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.Tracker.DTO.ExpenseRequestDTO;
import com.Tracker.DTO.ExpenseResponseDTO;
import com.Tracker.Security.UserDetailsImpl;
import com.Tracker.Service.ExpenseService;

@ExtendWith(MockitoExtension.class)
class ExpenseControllerTest {

    @Mock
    private ExpenseService expenseService;

    @InjectMocks
    private ExpenseController expenseController;

    @Test
    void createExpense_shouldReturnCreatedExpense() {
        UserDetailsImpl userDetails = new UserDetailsImpl(3L, "alice", "alice@email.com", "secret123",
                LocalDateTime.now());
        ExpenseRequestDTO request = new ExpenseRequestDTO("Groceries", "Food", new BigDecimal("52.50"),
                LocalDate.of(2026, 9, 22), "Weekly shopping");
        ExpenseResponseDTO expected = new ExpenseResponseDTO(10L, "Groceries", "Food", new BigDecimal("52.50"),
                LocalDate.of(2026, 9, 22), "Weekly shopping", LocalDateTime.now(), "alice");

        when(expenseService.createExpense(any(ExpenseRequestDTO.class), eq(3L))).thenReturn(expected);

        ResponseEntity<ExpenseResponseDTO> response = expenseController.createExpense(request, userDetails);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(expenseService).createExpense(request, 3L);
    }

    @Test
    void getAllExpenses_shouldReturnUserExpenses() {
        UserDetailsImpl userDetails = new UserDetailsImpl(3L, "alice", "alice@email.com", "secret123",
                LocalDateTime.now());
        ExpenseResponseDTO expense = new ExpenseResponseDTO(10L, "Groceries", "Food", new BigDecimal("52.50"),
                LocalDate.of(2026, 9, 22), "Weekly shopping", LocalDateTime.now(), "alice");

        when(expenseService.getAllExpensesByUser(3L)).thenReturn(List.of(expense));

        ResponseEntity<List<ExpenseResponseDTO>> response = expenseController.getAllExpenses(userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals("Groceries", response.getBody().get(0).getTitle());
    }

    @Test
    void getExpenseById_shouldReturnExpenseForCurrentUser() {
        UserDetailsImpl userDetails = new UserDetailsImpl(3L, "alice", "alice@email.com", "secret123",
                LocalDateTime.now());
        ExpenseResponseDTO expected = new ExpenseResponseDTO(10L, "Groceries", "Food", new BigDecimal("52.50"),
                LocalDate.of(2026, 9, 22), "Weekly shopping", LocalDateTime.now(), "alice");

        when(expenseService.getExpenseById(10L, 3L)).thenReturn(expected);

        ResponseEntity<ExpenseResponseDTO> response = expenseController.getExpenseById(10L, userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(expenseService).getExpenseById(10L, 3L);
    }

    @Test
    void updateExpense_shouldReturnUpdatedExpense() {
        UserDetailsImpl userDetails = new UserDetailsImpl(3L, "alice", "alice@email.com", "secret123",
                LocalDateTime.now());
        ExpenseRequestDTO request = new ExpenseRequestDTO("Rent", "Housing", new BigDecimal("1200.00"),
                LocalDate.of(2026, 10, 1), "Apartment rent");
        ExpenseResponseDTO expected = new ExpenseResponseDTO(10L, "Rent", "Housing", new BigDecimal("1200.00"),
                LocalDate.of(2026, 10, 1), "Apartment rent", LocalDateTime.now(), "alice");

        when(expenseService.updateExpense(10L, request, 3L)).thenReturn(expected);

        ResponseEntity<ExpenseResponseDTO> response = expenseController.updateExpense(10L, request, userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Rent", response.getBody().getTitle());
        verify(expenseService).updateExpense(10L, request, 3L);
    }

    @Test
    void deleteExpense_shouldInvokeServiceAndReturnNoContent() {
        UserDetailsImpl userDetails = new UserDetailsImpl(3L, "alice", "alice@email.com", "secret123",
                LocalDateTime.now());

        ResponseEntity<Void> response = expenseController.deleteExpense(10L, userDetails);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(expenseService).deleteExpense(10L, 3L);
    }

    @Test
    void getExpensesByCategory_shouldReturnFilteredExpenses() {
        UserDetailsImpl userDetails = new UserDetailsImpl(3L, "alice", "alice@email.com", "secret123",
                LocalDateTime.now());
        ExpenseResponseDTO expense = new ExpenseResponseDTO(10L, "Lunch", "Food", new BigDecimal("18.00"),
                LocalDate.of(2026, 9, 23), "Cafe", LocalDateTime.now(), "alice");

        when(expenseService.getExpensesByCategory(3L, "Food")).thenReturn(List.of(expense));

        ResponseEntity<List<ExpenseResponseDTO>> response = expenseController.getExpensesByCategory("Food",
                userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals("Food", response.getBody().get(0).getCategory());
    }

    @Test
    void getExpensesByDateRange_shouldReturnDateFilteredExpenses() {
        UserDetailsImpl userDetails = new UserDetailsImpl(3L, "alice", "alice@email.com", "secret123",
                LocalDateTime.now());
        LocalDate start = LocalDate.of(2026, 9, 1);
        LocalDate end = LocalDate.of(2026, 9, 30);
        ExpenseResponseDTO expense = new ExpenseResponseDTO(10L, "Groceries", "Food", new BigDecimal("52.50"),
                LocalDate.of(2026, 9, 22), "Weekly shopping", LocalDateTime.now(), "alice");

        when(expenseService.getExpensesByDateRange(3L, start, end)).thenReturn(List.of(expense));

        ResponseEntity<List<ExpenseResponseDTO>> response = expenseController.getExpensesByDateRange(start, end,
                userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals(LocalDate.of(2026, 9, 22), response.getBody().get(0).getExpenseDate());
    }

    @Test
    void getTotalExpenses_shouldReturnTotalMap() {
        UserDetailsImpl userDetails = new UserDetailsImpl(3L, "alice", "alice@email.com", "secret123",
                LocalDateTime.now());

        when(expenseService.getTotalExpenses(3L)).thenReturn(new BigDecimal("175.00"));

        ResponseEntity<Map<String, BigDecimal>> response = expenseController.getTotalExpenses(userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(new BigDecimal("175.00"), response.getBody().get("total"));
    }

    @Test
    void getTotalExpensesByCategory_shouldReturnCategoryTotal() {
        UserDetailsImpl userDetails = new UserDetailsImpl(3L, "alice", "alice@email.com", "secret123",
                LocalDateTime.now());

        when(expenseService.getTotalExpensesByCategory(3L, "Food")).thenReturn(new BigDecimal("90.00"));

        ResponseEntity<Map<String, Object>> response = expenseController.getTotalExpensesByCategory("Food",
                userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Food", response.getBody().get("category"));
        assertEquals(new BigDecimal("90.00"), response.getBody().get("total"));
    }

    @Test
    void getExpenseCount_shouldReturnCountMap() {
        UserDetailsImpl userDetails = new UserDetailsImpl(3L, "alice", "alice@email.com", "secret123",
                LocalDateTime.now());

        when(expenseService.getExpenseCount(3L)).thenReturn(4L);

        ResponseEntity<Map<String, Long>> response = expenseController.getExpenseCount(userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(4L, response.getBody().get("count"));
    }
}
