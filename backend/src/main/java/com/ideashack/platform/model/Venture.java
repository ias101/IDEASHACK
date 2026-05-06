package com.ideashack.platform.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ventures")
@Getter @Setter @NoArgsConstructor
public class Venture {

    public enum Stage {
        RESEARCH_ONLY, VALIDATION, COMMUNICATION, PROTOTYPE, INVESTOR_READY, IP_SENSITIVE;

        public String display() {
            return switch (this) {
                case RESEARCH_ONLY -> "Research-only";
                case VALIDATION -> "Validation";
                case COMMUNICATION -> "Communication";
                case PROTOTYPE -> "Prototype";
                case INVESTOR_READY -> "Investor-ready";
                case IP_SENSITIVE -> "IP-sensitive";
            };
        }

        public int index() {
            return ordinal();
        }

        public Stage next() {
            Stage[] vals = values();
            return ordinal() < vals.length - 1 ? vals[ordinal() + 1] : this;
        }
    }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(length = 3000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Stage stage = Stage.RESEARCH_ONLY;

    @Column(length = 500)
    private String ipStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "venture", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VentureMember> members = new ArrayList<>();

    @OneToMany(mappedBy = "venture", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    private List<Milestone> milestones = new ArrayList<>();
}
