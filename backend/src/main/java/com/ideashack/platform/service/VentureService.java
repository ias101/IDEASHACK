package com.ideashack.platform.service;

import com.ideashack.platform.model.*;
import com.ideashack.platform.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class VentureService {

    private final VentureRepository ventureRepo;
    private final VentureMemberRepository memberRepo;
    private final MilestoneRepository milestoneRepo;
    private final UserRepository userRepo;
    private final LedgerService ledger;

    public VentureService(VentureRepository ventureRepo, VentureMemberRepository memberRepo,
                          MilestoneRepository milestoneRepo, UserRepository userRepo, LedgerService ledger) {
        this.ventureRepo = ventureRepo;
        this.memberRepo = memberRepo;
        this.milestoneRepo = milestoneRepo;
        this.userRepo = userRepo;
        this.ledger = ledger;
    }

    public Map<String, Object> create(String title, String description, User creator) {
        Venture v = new Venture();
        v.setTitle(title);
        v.setDescription(description);
        v.setCreatedBy(creator);
        ventureRepo.save(v);

        VentureMember membership = new VentureMember(v, creator);
        memberRepo.save(membership);

        ledger.log(LedgerEntry.EventType.ROOM_CREATED, v.getId(),
                "Venture Room created: " + title, creator, null, null);

        return toDetail(v, creator.getId());
    }

    public List<Map<String, Object>> listForUser(Long userId) {
        return ventureRepo.findByMemberId(userId).stream()
                .map(v -> toSummary(v))
                .toList();
    }

    public Map<String, Object> getDetail(Long ventureId, Long requestingUserId) {
        Venture v = findOrThrow(ventureId);
        return toDetail(v, requestingUserId);
    }

    public Map<String, Object> advanceStage(Long ventureId, User actor) {
        Venture v = findOrThrow(ventureId);
        requireMember(ventureId, actor.getId());

        Venture.Stage from = v.getStage();
        Venture.Stage to = from.next();
        if (from == to) throw new IllegalStateException("Already at final stage");

        v.setStage(to);
        v.setUpdatedAt(LocalDateTime.now());
        ventureRepo.save(v);

        ledger.log(LedgerEntry.EventType.STAGE_CHANGE, ventureId,
                "Stage advanced: " + from.display() + " → " + to.display(),
                actor, from.display(), to.display());

        return toDetail(v, actor.getId());
    }

    public Map<String, Object> addMember(Long ventureId, String username, User actor) {
        requireMember(ventureId, actor.getId());
        Venture v = findOrThrow(ventureId);
        User newUser = userRepo.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));

        if (memberRepo.existsByVentureIdAndUserId(ventureId, newUser.getId()))
            throw new IllegalArgumentException("User is already a member");

        memberRepo.save(new VentureMember(v, newUser));
        v.setUpdatedAt(LocalDateTime.now());
        ventureRepo.save(v);

        ledger.log(LedgerEntry.EventType.MEMBER_JOIN, ventureId,
                newUser.getUsername() + " (" + newUser.getRole().name() + ") joined the venture",
                actor, null, null);

        return toDetail(ventureRepo.findById(ventureId).orElseThrow(), actor.getId());
    }

    public Map<String, Object> addMilestone(Long ventureId, String title, User actor) {
        requireMember(ventureId, actor.getId());
        Venture v = findOrThrow(ventureId);

        Milestone m = new Milestone();
        m.setVenture(v);
        m.setTitle(title);
        m.setStatus(Milestone.Status.PENDING);
        milestoneRepo.save(m);
        v.setUpdatedAt(LocalDateTime.now());
        ventureRepo.save(v);

        return Map.of("id", m.getId(), "title", m.getTitle(), "status", m.getStatus().name());
    }

    public Map<String, Object> updateMilestone(Long milestoneId, String statusStr, User actor) {
        Milestone m = milestoneRepo.findById(milestoneId)
                .orElseThrow(() -> new IllegalArgumentException("Milestone not found"));
        requireMember(m.getVenture().getId(), actor.getId());

        Milestone.Status status = Milestone.Status.valueOf(statusStr.toUpperCase());
        m.setStatus(status);
        if (status == Milestone.Status.DONE) m.setCompletedAt(LocalDateTime.now());
        milestoneRepo.save(m);

        LedgerEntry.EventType evType = status == Milestone.Status.DONE
                ? LedgerEntry.EventType.MILESTONE_COMPLETE
                : LedgerEntry.EventType.MILESTONE_ACTIVE;
        ledger.log(evType, m.getVenture().getId(),
                "Milestone \"" + m.getTitle() + "\" marked " + status.name(), actor, null, null);

        return Map.of("id", m.getId(), "title", m.getTitle(), "status", m.getStatus().name());
    }

    public Map<String, Object> updateIpStatus(Long ventureId, String ipStatus, User actor) {
        requireMember(ventureId, actor.getId());
        Venture v = findOrThrow(ventureId);
        v.setIpStatus(ipStatus);
        v.setUpdatedAt(LocalDateTime.now());
        ventureRepo.save(v);

        LedgerEntry.EventType type = ipStatus != null && !ipStatus.isBlank()
                ? LedgerEntry.EventType.IP_REGISTERED : LedgerEntry.EventType.IP_UPDATED;
        ledger.log(type, ventureId, "IP status updated: " + ipStatus, actor, null, null);

        return toDetail(v, actor.getId());
    }

    private Venture findOrThrow(Long id) {
        return ventureRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Venture not found"));
    }

    private void requireMember(Long ventureId, Long userId) {
        if (!memberRepo.existsByVentureIdAndUserId(ventureId, userId))
            throw new IllegalArgumentException("Not a member of this venture");
    }

    private Map<String, Object> toSummary(Venture v) {
        long done = v.getMilestones().stream().filter(m -> m.getStatus() == Milestone.Status.DONE).count();
        return Map.of(
                "id", v.getId(),
                "title", v.getTitle(),
                "description", v.getDescription() != null ? v.getDescription() : "",
                "stage", v.getStage().display(),
                "stageIndex", v.getStage().index(),
                "memberCount", v.getMembers().size(),
                "milestonesDone", done,
                "milestonesTotal", v.getMilestones().size(),
                "updatedAt", v.getUpdatedAt().toString()
        );
    }

    private Map<String, Object> toDetail(Venture v, Long viewerId) {
        List<Map<String, Object>> members = v.getMembers().stream().map(m -> {
            User u = m.getUser();
            return Map.<String, Object>of(
                    "userId", u.getId(),
                    "username", u.getUsername(),
                    "role", u.getRole().name(),
                    "institution", u.getInstitution() != null ? u.getInstitution() : "",
                    "avatar", u.getAvatar(),
                    "joinedAt", m.getJoinedAt().toString()
            );
        }).toList();

        List<Map<String, Object>> milestones = v.getMilestones().stream().map(m -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", m.getId());
            map.put("title", m.getTitle());
            map.put("status", m.getStatus().name());
            map.put("completedAt", m.getCompletedAt() != null ? m.getCompletedAt().toString() : "");
            return map;
        }).toList();

        boolean isMember = v.getMembers().stream().anyMatch(m -> m.getUser().getId().equals(viewerId));

        return Map.of(
                "id", v.getId(),
                "title", v.getTitle(),
                "description", v.getDescription() != null ? v.getDescription() : "",
                "stage", v.getStage().display(),
                "stageIndex", v.getStage().index(),
                "ipStatus", v.getIpStatus() != null ? v.getIpStatus() : "",
                "members", members,
                "milestones", milestones,
                "isMember", isMember,
                "updatedAt", v.getUpdatedAt().toString()
        );
    }
}
