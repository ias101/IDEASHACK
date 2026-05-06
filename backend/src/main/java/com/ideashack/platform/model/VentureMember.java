package com.ideashack.platform.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "venture_members",
       uniqueConstraints = @UniqueConstraint(columnNames = {"venture_id", "user_id"}))
@Getter @Setter @NoArgsConstructor
public class VentureMember {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venture_id", nullable = false)
    private Venture venture;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime joinedAt = LocalDateTime.now();

    public VentureMember(Venture venture, User user) {
        this.venture = venture;
        this.user = user;
    }
}
