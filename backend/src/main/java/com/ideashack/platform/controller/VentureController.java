package com.ideashack.platform.controller;

import com.ideashack.platform.model.User;
import com.ideashack.platform.repository.UserRepository;
import com.ideashack.platform.security.JwtUtil;
import com.ideashack.platform.service.VentureService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ventures")
public class VentureController extends BaseController {

    private final VentureService ventureService;

    public VentureController(UserRepository userRepo, JwtUtil jwtUtil, VentureService ventureService) {
        super(userRepo, jwtUtil);
        this.ventureService = ventureService;
    }

    @GetMapping
    public ResponseEntity<?> list(Authentication auth) {
        return ResponseEntity.ok(ventureService.listForUser(currentUser(auth).getId()));
    }

    @PostMapping
    public ResponseEntity<?> create(Authentication auth, @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(ventureService.create(body.get("title"), body.get("description"), currentUser(auth)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> detail(Authentication auth, @PathVariable Long id) {
        try {
            return ResponseEntity.ok(ventureService.getDetail(id, currentUser(auth).getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/advance-stage")
    public ResponseEntity<?> advanceStage(Authentication auth, @PathVariable Long id) {
        try {
            return ResponseEntity.ok(ventureService.advanceStage(id, currentUser(auth)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<?> addMember(Authentication auth, @PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(ventureService.addMember(id, body.get("username"), currentUser(auth)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/milestones")
    public ResponseEntity<?> addMilestone(Authentication auth, @PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(ventureService.addMilestone(id, body.get("title"), currentUser(auth)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/milestones/{milestoneId}")
    public ResponseEntity<?> updateMilestone(Authentication auth, @PathVariable Long milestoneId, @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(ventureService.updateMilestone(milestoneId, body.get("status"), currentUser(auth)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/ip-status")
    public ResponseEntity<?> updateIpStatus(Authentication auth, @PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(ventureService.updateIpStatus(id, body.get("ipStatus"), currentUser(auth)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
