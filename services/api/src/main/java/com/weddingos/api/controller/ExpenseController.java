package com.weddingos.api.controller;

import com.weddingos.api.model.Expense;
import com.weddingos.api.service.ExpenseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/expenses")
@Tag(name = "Budget & Expenses", description = "Endpoints for managing wedding budget, recorded spending, category breakdowns and ledger line items")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @GetMapping
    @Operation(summary = "Get full expenditure ledger with budget health, runway and category breakdowns")
    public ResponseEntity<Map<String, Object>> getExpenses(@RequestParam(defaultValue = "1") Long weddingId) {
        return ResponseEntity.ok(expenseService.getExpensesWithSummary(weddingId));
    }

    @PostMapping
    @Operation(summary = "Record a new wedding expense in the ledger")
    public ResponseEntity<Expense> createExpense(
            @RequestParam(defaultValue = "1") Long weddingId,
            @RequestBody Expense expense) {
        return ResponseEntity.ok(expenseService.createExpense(weddingId, expense));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing expense line item")
    public ResponseEntity<Expense> updateExpense(@PathVariable Long id, @RequestBody Expense expense) {
        return ResponseEntity.ok(expenseService.updateExpense(id, expense));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an expense line item")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }
}
