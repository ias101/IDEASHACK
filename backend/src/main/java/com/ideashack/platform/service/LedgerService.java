package com.ideashack.platform.service;

import com.ideashack.platform.model.LedgerEntry;
import com.ideashack.platform.model.User;
import com.ideashack.platform.repository.LedgerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class LedgerService {

    private final LedgerRepository ledgerRepo;

    public LedgerService(LedgerRepository ledgerRepo) {
        this.ledgerRepo = ledgerRepo;
    }

    public LedgerEntry log(LedgerEntry.EventType type, Long ventureId, String detail,
                            User actor, String fromStage, String toStage) {
        LedgerEntry entry = new LedgerEntry();
        entry.setType(type);
        entry.setVentureId(ventureId);
        entry.setDetail(detail);
        entry.setActorId(actor.getId());
        entry.setActorName(actor.getUsername());
        entry.setActorRole(actor.getRole().name());
        entry.setFromStage(fromStage);
        entry.setToStage(toStage);
        return ledgerRepo.save(entry);
    }

    public List<Map<String, Object>> getAll() {
        return ledgerRepo.findAllByOrderByTimestampDesc().stream().map(this::toMap).toList();
    }

    public List<Map<String, Object>> getByVenture(Long ventureId) {
        return ledgerRepo.findByVentureIdOrderByTimestampDesc(ventureId).stream().map(this::toMap).toList();
    }

    public List<Map<String, Object>> getRecent() {
        return ledgerRepo.findTop20ByOrderByTimestampDesc().stream().map(this::toMap).toList();
    }

    private Map<String, Object> toMap(LedgerEntry e) {
        return Map.of(
                "id", e.getId(),
                "type", e.getType().name(),
                "ventureId", e.getVentureId() != null ? e.getVentureId() : 0,
                "detail", e.getDetail(),
                "actorId", e.getActorId(),
                "actorName", e.getActorName(),
                "actorRole", e.getActorRole(),
                "fromStage", e.getFromStage() != null ? e.getFromStage() : "",
                "toStage", e.getToStage() != null ? e.getToStage() : "",
                "timestamp", e.getTimestamp().toString()
        );
    }
}
