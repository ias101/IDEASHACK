package com.ideashack.platform.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "ledger_entries")
@Getter @Setter @NoArgsConstructor
public class LedgerEntry {

    public enum EventType {
        ROOM_CREATED, MEMBER_JOIN, STAGE_CHANGE, MILESTONE_COMPLETE,
        MILESTONE_ACTIVE, AI_AUDIT, IP_REGISTERED, IP_UPDATED
    }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventType type;

    private Long ventureId;

    @Column(nullable = false, length = 1000)
    private String detail;

    @Column(nullable = false)
    private Long actorId;

    @Column(nullable = false, length = 100)
    private String actorName;

    @Column(nullable = false, length = 20)
    private String actorRole;

    @Column(length = 50)
    private String fromStage;

    @Column(length = 50)
    private String toStage;

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();
}
