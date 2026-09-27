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

import com.Tracker.DTO.IncomeRequestDTO;
import com.Tracker.DTO.IncomeResponseDTO;
import com.Tracker.Entity.Income;
import com.Tracker.Entity.User;
import com.Tracker.Repository.IncomeRepository;
import com.Tracker.Repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class IncomeServiceTest {

    @Mock
    private IncomeRepository incomeRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private IncomeService incomeService;

    @Test
    void createIncome_shouldSaveAndReturnDto() {
        User user = new User("bob", "bob@email.com", "encoded-password");
        user.setId(2L);
        IncomeRequestDTO request = new IncomeRequestDTO("Salary", "Job", new BigDecimal("4200.00"),
                LocalDate.of(2026, 9, 1), "Monthly pay");
        Income income = new Income(user, "Salary", "Job", new BigDecimal("4200.00"), LocalDate.of(2026, 9, 1),
                "Monthly pay");
        income.setId(7L);

        when(userRepository.findById(2L)).thenReturn(Optional.of(user));
        when(incomeRepository.save(any(Income.class))).thenReturn(income);

        IncomeResponseDTO result = incomeService.createIncome(request, 2L);

        assertEquals("Salary", result.getTitle());
        assertEquals("bob", result.getUsername());
        verify(incomeRepository).save(any(Income.class));
    }

    @Test
    void getIncomeById_whenOwnedByUser_shouldReturnIncome() {
        User user = new User("bob", "bob@email.com", "encoded-password");
        user.setId(2L);
        Income income = new Income(user, "Bonus", "Job", new BigDecimal("500.00"), LocalDate.of(2026, 9, 10),
                "Quarterly bonus");
        income.setId(9L);

        when(incomeRepository.findById(9L)).thenReturn(Optional.of(income));

        IncomeResponseDTO result = incomeService.getIncomeById(9L, 2L);

        assertEquals("Bonus", result.getTitle());
    }

    @Test
    void getIncomeById_whenAnotherUserOwnsIncome_shouldThrow() {
        User owner = new User("bob", "bob@email.com", "encoded-password");
        owner.setId(2L);
        User otherUser = new User("alice", "alice@email.com", "encoded-password");
        otherUser.setId(1L);
        Income income = new Income(owner, "Bonus", "Job", new BigDecimal("500.00"), LocalDate.of(2026, 9, 10),
                "Quarterly bonus");
        income.setId(9L);

        when(incomeRepository.findById(9L)).thenReturn(Optional.of(income));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> incomeService.getIncomeById(9L, 1L));
        assertEquals("Unauthorized: You don't have permission to access this income", exception.getMessage());
    }

    @Test
    void updateIncome_shouldUpdateFieldsAndReturnDto() {
        User user = new User("bob", "bob@email.com", "encoded-password");
        user.setId(2L);
        Income income = new Income(user, "Old salary", "Job", new BigDecimal("4000.00"), LocalDate.of(2026, 8, 1),
                "Old");
        income.setId(6L);
        IncomeRequestDTO request = new IncomeRequestDTO("Updated salary", "Job", new BigDecimal("4400.00"),
                LocalDate.of(2026, 9, 1), "Updated");

        when(incomeRepository.findById(6L)).thenReturn(Optional.of(income));
        when(incomeRepository.save(any(Income.class))).thenAnswer(invocation -> invocation.getArgument(0));

        IncomeResponseDTO result = incomeService.updateIncome(6L, request, 2L);

        assertEquals("Updated salary", result.getTitle());
        assertEquals(new BigDecimal("4400.00"), result.getAmount());
    }

    @Test
    void getAllIncomesByUser_shouldReturnDtoList() {
        User user = new User("bob", "bob@email.com", "encoded-password");
        user.setId(2L);
        Income income = new Income(user, "Freelance", "SideGig", new BigDecimal("300.00"), LocalDate.of(2026, 9, 15),
                "Website project");
        income.setId(8L);

        when(incomeRepository.findByUserId(2L)).thenReturn(List.of(income));

        List<IncomeResponseDTO> result = incomeService.getAllIncomesByUser(2L);

        assertEquals(1, result.size());
        assertEquals("Freelance", result.get(0).getTitle());
    }

    @Test
    void getTotalIncomes_shouldReturnZeroWhenNull() {
        when(incomeRepository.getTotalIncomesByUser(2L)).thenReturn(null);

        BigDecimal total = incomeService.getTotalIncomes(2L);

        assertEquals(BigDecimal.ZERO, total);
    }
}
