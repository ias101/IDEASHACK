package com.ideashack.platform.controller;

import com.ideashack.platform.model.User;
import com.ideashack.platform.repository.UserRepository;
import com.ideashack.platform.security.JwtUtil;
import com.ideashack.platform.service.LedgerService;
import com.ideashack.platform.service.OpenAIService;
import com.ideashack.platform.service.UserService;
import com.ideashack.platform.model.LedgerEntry;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/audit")
public class AuditController extends BaseController {

    private final OpenAIService openAIService;
    private final UserService userService;
    private final LedgerService ledgerService;

    public AuditController(UserRepository userRepo, JwtUtil jwtUtil,
                           OpenAIService openAIService, UserService userService,
                           LedgerService ledgerService) {
        super(userRepo, jwtUtil);
        this.openAIService = openAIService;
        this.userService = userService;
        this.ledgerService = ledgerService;
    }

    @PostMapping("/run")
    public ResponseEntity<?> runAudit(Authentication auth, @RequestBody Map<String, Object> body) {
        try {
            User user = currentUser(auth);
            String apiKey = userService.getApiKey(user.getId());
            if (apiKey == null || apiKey.isBlank())
                return ResponseEntity.badRequest().body(Map.of("error", "No OpenAI API key configured. Go to Settings to add one."));

            String input = (String) body.get("input");
            Long ventureId = body.get("ventureId") != null
                    ? Long.parseLong(body.get("ventureId").toString()) : null;

            Map<String, Object> result = openAIService.runAudit(apiKey, input);

            String detail = "AI Commercialization Audit completed" +
                    (ventureId != null ? " for venture #" + ventureId : "");
            ledgerService.log(LedgerEntry.EventType.AI_AUDIT, ventureId, detail, user, null, null);

            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
