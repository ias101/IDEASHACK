package com.ideashack.platform.service;

import com.ideashack.platform.model.User;
import com.ideashack.platform.repository.UserRepository;
import com.ideashack.platform.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepo, PasswordEncoder encoder, JwtUtil jwtUtil) {
        this.userRepo = userRepo;
        this.encoder = encoder;
        this.jwtUtil = jwtUtil;
    }

    public Map<String, Object> register(String username, String email, String password,
                                         String roleStr, String institution, String department) {
        if (userRepo.existsByUsername(username)) throw new IllegalArgumentException("Username already taken");
        if (userRepo.existsByEmail(email)) throw new IllegalArgumentException("Email already registered");

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(encoder.encode(password));
        user.setRole(User.Role.valueOf(roleStr.toUpperCase()));
        user.setInstitution(institution);
        user.setDepartment(department);
        userRepo.save(user);

        String token = jwtUtil.generate(user.getUsername(), user.getId());
        return buildAuthResponse(user, token);
    }

    public Map<String, Object> login(String usernameOrEmail, String password) {
        User user = userRepo.findByUsername(usernameOrEmail)
                .or(() -> userRepo.findByEmail(usernameOrEmail))
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!encoder.matches(password, user.getPasswordHash()))
            throw new IllegalArgumentException("Invalid credentials");

        String token = jwtUtil.generate(user.getUsername(), user.getId());
        return buildAuthResponse(user, token);
    }

    private Map<String, Object> buildAuthResponse(User user, String token) {
        return Map.of(
                "token", token,
                "user", Map.of(
                        "id", user.getId(),
                        "username", user.getUsername(),
                        "email", user.getEmail(),
                        "role", user.getRole().name(),
                        "institution", user.getInstitution() != null ? user.getInstitution() : "",
                        "department", user.getDepartment() != null ? user.getDepartment() : "",
                        "avatar", user.getAvatar(),
                        "hasApiKey", user.getOpenaiApiKey() != null && !user.getOpenaiApiKey().isBlank()
                )
        );
    }
}
