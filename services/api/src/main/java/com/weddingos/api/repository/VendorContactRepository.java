package com.weddingos.api.repository;

import com.weddingos.api.model.VendorContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VendorContactRepository extends JpaRepository<VendorContact, Long> {
    List<VendorContact> findByWeddingIdOrderByBusinessNameAsc(Long weddingId);
    List<VendorContact> findByWeddingIdAndCategory(Long weddingId, String category);
}
