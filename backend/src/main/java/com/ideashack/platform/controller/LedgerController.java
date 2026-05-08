package com.ideashack.platform.controller;

import com.ideashack.platform.model.User;
import com.ideashack.platform.repository.UserRepository;
import com.ideashack.platform.security.JwtUtil;
import com.ideashack.platform.service.LedgerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ledger")
public class LedgerController extends BaseController {

    private final LedgerService ledgerService;

    public LedgerController(UserRepository userRepo, JwtUtil jwtUtil, LedgerService ledgerService) {
        super(userRepo, jwtUtil);
        this.ledgerService = ledgerService;
    }

    @GetMapping
    public ResponseEntity<?> getAll(Authentication auth) {
        User user = currentUser(auth);
        return ResponseEntity.ok(ledgerService.getAllByActor(user.getId()));
    }

    @GetMapping("/recent")
    public ResponseEntity<?> getRecent(Authentication auth) {
        User user = currentUser(auth);
        return ResponseEntity.ok(ledgerService.getRecentByActor(user.getId()));
    }

    @GetMapping("/venture/{ventureId}")
    public ResponseEntity<?> getByVenture(@PathVariable Long ventureId) {
        return ResponseEntity.ok(ledgerService.getByVenture(ventureId));
    }
}
