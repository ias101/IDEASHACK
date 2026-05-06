package com.ideashack.platform.service;

import com.ideashack.platform.model.User;
import com.ideashack.platform.model.Venture;
import com.ideashack.platform.repository.LedgerRepository;
import com.ideashack.platform.repository.UserRepository;
import com.ideashack.platform.repository.VentureRepository;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class UserService {

    private final UserRepository userRepo;
    private final VentureRepository ventureRepo;
    private final LedgerRepository ledgerRepo;

    public UserService(UserRepository userRepo, VentureRepository ventureRepo, LedgerRepository ledgerRepo) {
        this.userRepo = userRepo;
        this.ventureRepo = ventureRepo;
        this.ledgerRepo = ledgerRepo;
    }

    public User getUser(Long id) {
        return userRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public Map<String, Object> getProfile(Long userId) {
        User u = getUser(userId);
        long ventures = ventureRepo.findByMemberId(userId).size();
        long events = ledgerRepo.findAllByOrderByTimestampDesc().stream()
                .filter(e -> e.getActorId().equals(userId)).count();

        return Map.of(
                "id", u.getId(),
                "username", u.getUsername(),
                "email", u.getEmail(),
                "role", u.getRole().name(),
                "institution", u.getInstitution() != null ? u.getInstitution() : "",
                "department", u.getDepartment() != null ? u.getDepartment() : "",
                "avatar", u.getAvatar(),
                "hasApiKey", u.getOpenaiApiKey() != null && !u.getOpenaiApiKey().isBlank(),
                "metrics", Map.of(
                        "ventures", ventures,
                        "events", events
                )
        );
    }

    public void updateProfile(Long userId, String institution, String department) {
        User u = getUser(userId);
        if (institution != null) u.setInstitution(institution);
        if (department != null) u.setDepartment(department);
        userRepo.save(u);
    }

    public void saveApiKey(Long userId, String apiKey) {
        User u = getUser(userId);
        u.setOpenaiApiKey(apiKey != null ? apiKey.trim() : null);
        userRepo.save(u);
    }

    public String getApiKey(Long userId) {
        return getUser(userId).getOpenaiApiKey();
    }

    public Map<String, Object> getMaskedProfile(Long userId) {
        User u = getUser(userId);
        String masked = null;
        if (u.getOpenaiApiKey() != null && u.getOpenaiApiKey().length() > 8) {
            String key = u.getOpenaiApiKey();
            masked = key.substring(0, 7) + "..." + key.substring(key.length() - 4);
        }
        return Map.of(
                "id", u.getId(),
                "username", u.getUsername(),
                "email", u.getEmail(),
                "role", u.getRole().name(),
                "institution", u.getInstitution() != null ? u.getInstitution() : "",
                "department", u.getDepartment() != null ? u.getDepartment() : "",
                "avatar", u.getAvatar(),
                "maskedApiKey", masked != null ? masked : "",
                "hasApiKey", u.getOpenaiApiKey() != null && !u.getOpenaiApiKey().isBlank()
        );
    }
}
