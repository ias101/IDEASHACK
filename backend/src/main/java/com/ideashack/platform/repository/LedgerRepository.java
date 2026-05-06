package com.ideashack.platform.repository;

import com.ideashack.platform.model.LedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LedgerRepository extends JpaRepository<LedgerEntry, Long> {
    List<LedgerEntry> findAllByOrderByTimestampDesc();
    List<LedgerEntry> findByVentureIdOrderByTimestampDesc(Long ventureId);
    List<LedgerEntry> findTop20ByOrderByTimestampDesc();
}
