package com.weddingos.api.repository;

import com.weddingos.api.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByWeddingIdOrderByExpenseDateDesc(Long weddingId);
    List<Expense> findByWeddingIdAndCategory(Long weddingId, String category);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.wedding.id = :weddingId")
    BigDecimal sumTotalRecorded(@Param("weddingId") Long weddingId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.wedding.id = :weddingId AND e.paymentStatus = 'PAID'")
    BigDecimal sumTotalPaid(@Param("weddingId") Long weddingId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.wedding.id = :weddingId AND e.paymentStatus = 'ADVANCE_PAID'")
    BigDecimal sumTotalAdvancePaid(@Param("weddingId") Long weddingId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.wedding.id = :weddingId AND e.paymentStatus = 'PENDING'")
    BigDecimal sumTotalPending(@Param("weddingId") Long weddingId);
}
