package com.ideashack.platform.controller;

import com.ideashack.platform.model.User;
import com.ideashack.platform.repository.UserRepository;
import com.ideashack.platform.security.JwtUtil;
import org.springframework.security.core.Authentication;

public abstract class BaseController {

    protected final UserRepository userRepo;
    protected final JwtUtil jwtUtil;

    protected BaseController(UserRepository userRepo, JwtUtil jwtUtil) {
        this.userRepo = userRepo;
        this.jwtUtil = jwtUtil;
    }

    protected User currentUser(Authentication auth) {
        return userRepo.findByUsername(auth.getName())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
    }
}
