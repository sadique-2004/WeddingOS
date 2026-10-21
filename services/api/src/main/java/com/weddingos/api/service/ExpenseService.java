package com.weddingos.api.service;

import com.weddingos.api.exception.NotFoundException;
import com.weddingos.api.model.Expense;
import com.weddingos.api.model.Wedding;
import com.weddingos.api.repository.ExpenseRepository;
import com.weddingos.api.security.WeddingAccessService;
import com.weddingos.api.security.WeddingModule;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

import static com.weddingos.api.security.WeddingAccessService.weddingIdOf;

@Service
@Transactional
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final WeddingAccessService access;

    public ExpenseService(ExpenseRepository expenseRepository, WeddingAccessService access) {
        this.expenseRepository = expenseRepository;
        this.access = access;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getExpensesWithSummary(Long weddingId) {
        Wedding wedding = access.require(weddingId, WeddingModule.EXPENSES).wedding();

        List<Expense> expenses = expenseRepository.findByWeddingIdOrderByExpenseDateDesc(weddingId);
        BigDecimal totalBudget = wedding.getTotalBudgetTarget();
        BigDecimal totalSpent = expenseRepository.sumTotalRecorded(weddingId);
        BigDecimal totalPaid = expenseRepository.sumTotalPaid(weddingId);
        BigDecimal totalAdvancePaid = expenseRepository.sumTotalAdvancePaid(weddingId);
        BigDecimal totalPending = expenseRepository.sumTotalPending(weddingId);
        BigDecimal remainingBudget = totalBudget.subtract(totalSpent);

        int utilization = totalBudget.compareTo(BigDecimal.ZERO) > 0
                ? totalSpent.multiply(new BigDecimal(100)).divide(totalBudget, 0, RoundingMode.HALF_UP).intValue()
                : 0;

        // Group by category
        Map<String, BigDecimal> categorySums = new HashMap<>();
        for (Expense e : expenses) {
            categorySums.put(e.getCategory(), categorySums.getOrDefault(e.getCategory(), BigDecimal.ZERO).add(e.getAmount()));
        }

        List<Map<String, Object>> categoryBreakdown = new ArrayList<>();
        for (Map.Entry<String, BigDecimal> entry : categorySums.entrySet()) {
            Map<String, Object> catMap = new HashMap<>();
            catMap.put("category", entry.getKey());
            catMap.put("amount", entry.getValue());
            int pct = totalSpent.compareTo(BigDecimal.ZERO) > 0
                    ? entry.getValue().multiply(new BigDecimal(100)).divide(totalSpent, 0, RoundingMode.HALF_UP).intValue()
                    : 0;
            catMap.put("percentage", pct);
            categoryBreakdown.add(catMap);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("expenses", expenses);
        result.put("totalBudget", totalBudget);
        result.put("totalRecorded", totalSpent);
        result.put("totalPaid", totalPaid.add(totalAdvancePaid));
        result.put("totalPendingDues", totalPending);
        result.put("remainingBudget", remainingBudget);
        result.put("utilizationPercentage", Math.min(utilization, 100));
        result.put("categoryBreakdown", categoryBreakdown);
        result.put("currencyCode", wedding.getCurrencyCode());

        return result;
    }

    public Expense createExpense(Long weddingId, Expense expense) {
        Wedding wedding = access.require(weddingId, WeddingModule.EXPENSES).wedding();
        expense.setId(null); // never let a client-supplied ID overwrite an existing row
        expense.setWedding(wedding);
        return expenseRepository.save(expense);
    }

    public Expense updateExpense(Long id, Expense updates) {
        Expense existing = loadAuthorized(id);

        if (updates.getTitle() != null) existing.setTitle(updates.getTitle());
        if (updates.getCategory() != null) existing.setCategory(updates.getCategory());
        if (updates.getAmount() != null) existing.setAmount(updates.getAmount());
        if (updates.getExpenseDate() != null) existing.setExpenseDate(updates.getExpenseDate());
        if (updates.getPaymentStatus() != null) existing.setPaymentStatus(updates.getPaymentStatus());
        if (updates.getPaymentMethod() != null) existing.setPaymentMethod(updates.getPaymentMethod());
        if (updates.getNotes() != null) existing.setNotes(updates.getNotes());

        return expenseRepository.save(existing);
    }

    public void deleteExpense(Long id) {
        expenseRepository.delete(loadAuthorized(id));
    }

    /** Loads an expense and checks EXPENSES permission on the wedding that owns it. */
    private Expense loadAuthorized(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Expense not found: " + id));
        access.require(weddingIdOf(expense.getWedding()), WeddingModule.EXPENSES);
        return expense;
    }
}
