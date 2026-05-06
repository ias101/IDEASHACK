package com.ideashack.platform.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor
public class User {

    public enum Role { RESEARCHER, BUSINESS, INVESTOR }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(length = 200)
    private String institution;

    @Column(length = 100)
    private String department;

    @Column(length = 500)
    private String openaiApiKey;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public String getAvatar() {
        if (username == null || username.isBlank()) return "??";
        String[] parts = username.trim().split("\\s+");
        if (parts.length >= 2) return ("" + parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
        return username.substring(0, Math.min(2, username.length())).toUpperCase();
    }
}
