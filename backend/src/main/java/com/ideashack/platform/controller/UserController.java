package com.ideashack.platform.controller;

import com.ideashack.platform.repository.UserRepository;
import com.ideashack.platform.security.JwtUtil;
import com.ideashack.platform.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController extends BaseController {

    private final UserService userService;

    public UserController(UserRepository userRepo, JwtUtil jwtUtil, UserService userService) {
        super(userRepo, jwtUtil);
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(Authentication auth) {
        return ResponseEntity.ok(userService.getMaskedProfile(currentUser(auth).getId()));
    }

    @GetMapping("/me/passport")
    public ResponseEntity<?> getPassport(Authentication auth) {
        return ResponseEntity.ok(userService.getProfile(currentUser(auth).getId()));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(Authentication auth, @RequestBody Map<String, String> body) {
        userService.updateProfile(currentUser(auth).getId(), body.get("institution"), body.get("department"));
        return ResponseEntity.ok(userService.getMaskedProfile(currentUser(auth).getId()));
    }

    @PutMapping("/me/api-key")
    public ResponseEntity<?> saveApiKey(Authentication auth, @RequestBody Map<String, String> body) {
        try {
            userService.saveApiKey(currentUser(auth).getId(), body.get("apiKey"));
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
