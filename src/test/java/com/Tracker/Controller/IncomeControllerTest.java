package com.Tracker.Controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.Tracker.DTO.IncomeRequestDTO;
import com.Tracker.DTO.IncomeResponseDTO;
import com.Tracker.Security.UserDetailsImpl;
import com.Tracker.Service.IncomeService;

@ExtendWith(MockitoExtension.class)
class IncomeControllerTest {

    @Mock
    private IncomeService incomeService;

    @InjectMocks
    private IncomeController incomeController;

    @Test
    void createIncome_shouldReturnCreatedIncome() {
        UserDetailsImpl userDetails = new UserDetailsImpl(4L, "bob", "bob@email.com", "secret123",
                LocalDateTime.now());
        IncomeRequestDTO request = new IncomeRequestDTO("Salary", "Job", new BigDecimal("4200.00"),
                LocalDate.of(2026, 9, 1), "Monthly pay");
        IncomeResponseDTO expected = new IncomeResponseDTO(5L, "Salary", "Job", new BigDecimal("4200.00"),
                LocalDate.of(2026, 9, 1), "Monthly pay", LocalDateTime.now(), "bob");

        when(incomeService.createIncome(any(IncomeRequestDTO.class), eq(4L))).thenReturn(expected);

        ResponseEntity<IncomeResponseDTO> response = incomeController.createIncome(request, userDetails);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(incomeService).createIncome(request, 4L);
    }

    @Test
    void getAllIncomes_shouldReturnUserIncomes() {
        UserDetailsImpl userDetails = new UserDetailsImpl(4L, "bob", "bob@email.com", "secret123", LocalDateTime.now());
        IncomeResponseDTO income = new IncomeResponseDTO(5L, "Salary", "Job", new BigDecimal("4200.00"),
                LocalDate.of(2026, 9, 1), "Monthly pay", LocalDateTime.now(), "bob");

        when(incomeService.getAllIncomesByUser(4L)).thenReturn(List.of(income));

        ResponseEntity<List<IncomeResponseDTO>> response = incomeController.getAllIncomes(userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals("Salary", response.getBody().get(0).getTitle());
    }

    @Test
    void getIncomeById_shouldReturnIncomeForCurrentUser() {
        UserDetailsImpl userDetails = new UserDetailsImpl(4L, "bob", "bob@email.com", "secret123", LocalDateTime.now());
        IncomeResponseDTO expected = new IncomeResponseDTO(5L, "Salary", "Job", new BigDecimal("4200.00"),
                LocalDate.of(2026, 9, 1), "Monthly pay", LocalDateTime.now(), "bob");

        when(incomeService.getIncomeById(5L, 4L)).thenReturn(expected);

        ResponseEntity<IncomeResponseDTO> response = incomeController.getIncomeById(5L, userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(incomeService).getIncomeById(5L, 4L);
    }

    @Test
    void updateIncome_shouldReturnUpdatedIncome() {
        UserDetailsImpl userDetails = new UserDetailsImpl(4L, "bob", "bob@email.com", "secret123", LocalDateTime.now());
        IncomeRequestDTO request = new IncomeRequestDTO("Bonus", "Job", new BigDecimal("500.00"),
                LocalDate.of(2026, 9, 10), "Quarterly bonus");
        IncomeResponseDTO expected = new IncomeResponseDTO(5L, "Bonus", "Job", new BigDecimal("500.00"),
                LocalDate.of(2026, 9, 10), "Quarterly bonus", LocalDateTime.now(), "bob");

        when(incomeService.updateIncome(5L, request, 4L)).thenReturn(expected);

        ResponseEntity<IncomeResponseDTO> response = incomeController.updateIncome(5L, request, userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Bonus", response.getBody().getTitle());
        verify(incomeService).updateIncome(5L, request, 4L);
    }

    @Test
    void deleteIncome_shouldInvokeServiceAndReturnNoContent() {
        UserDetailsImpl userDetails = new UserDetailsImpl(4L, "bob", "bob@email.com", "secret123", LocalDateTime.now());

        ResponseEntity<Void> response = incomeController.deleteIncome(5L, userDetails);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(incomeService).deleteIncome(5L, 4L);
    }

    @Test
    void getIncomesByCategory_shouldReturnFilteredIncomes() {
        UserDetailsImpl userDetails = new UserDetailsImpl(4L, "bob", "bob@email.com", "secret123", LocalDateTime.now());
        IncomeResponseDTO income = new IncomeResponseDTO(5L, "Freelance", "SideGig", new BigDecimal("300.00"),
                LocalDate.of(2026, 9, 15), "Website project", LocalDateTime.now(), "bob");

        when(incomeService.getIncomesByCategory(4L, "SideGig")).thenReturn(List.of(income));

        ResponseEntity<List<IncomeResponseDTO>> response = incomeController.getIncomesByCategory("SideGig",
                userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals("SideGig", response.getBody().get(0).getCategory());
    }

    @Test
    void getIncomesByDateRange_shouldReturnDateFilteredIncomes() {
        UserDetailsImpl userDetails = new UserDetailsImpl(4L, "bob", "bob@email.com", "secret123", LocalDateTime.now());
        LocalDate start = LocalDate.of(2026, 9, 1);
        LocalDate end = LocalDate.of(2026, 9, 30);
        IncomeResponseDTO income = new IncomeResponseDTO(5L, "Salary", "Job", new BigDecimal("4200.00"),
                LocalDate.of(2026, 9, 1), "Monthly pay", LocalDateTime.now(), "bob");

        when(incomeService.getIncomesByDateRange(4L, start, end)).thenReturn(List.of(income));

        ResponseEntity<List<IncomeResponseDTO>> response = incomeController.getIncomesByDateRange(start, end,
                userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals("Salary", response.getBody().get(0).getTitle());
    }

    @Test
    void getTotalIncomes_shouldReturnTotalMap() {
        UserDetailsImpl userDetails = new UserDetailsImpl(4L, "bob", "bob@email.com", "secret123", LocalDateTime.now());

        when(incomeService.getTotalIncomes(4L)).thenReturn(new BigDecimal("5000.00"));

        ResponseEntity<Map<String, BigDecimal>> response = incomeController.getTotalIncomes(userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(new BigDecimal("5000.00"), response.getBody().get("total"));
    }

    @Test
    void getTotalIncomesByCategory_shouldReturnCategoryTotal() {
        UserDetailsImpl userDetails = new UserDetailsImpl(4L, "bob", "bob@email.com", "secret123", LocalDateTime.now());

        when(incomeService.getTotalIncomesByCategory(4L, "Job")).thenReturn(new BigDecimal("4200.00"));

        ResponseEntity<Map<String, Object>> response = incomeController.getTotalIncomesByCategory("Job", userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Job", response.getBody().get("category"));
        assertEquals(new BigDecimal("4200.00"), response.getBody().get("total"));
    }

    @Test
    void getIncomeCount_shouldReturnCountMap() {
        UserDetailsImpl userDetails = new UserDetailsImpl(4L, "bob", "bob@email.com", "secret123", LocalDateTime.now());

        when(incomeService.getIncomeCount(4L)).thenReturn(3L);

        ResponseEntity<Map<String, Long>> response = incomeController.getIncomeCount(userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(3L, response.getBody().get("count"));
    }
}
