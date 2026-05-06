package com.ideashack.platform.repository;

import com.ideashack.platform.model.VentureMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VentureMemberRepository extends JpaRepository<VentureMember, Long> {
    boolean existsByVentureIdAndUserId(Long ventureId, Long userId);
    Optional<VentureMember> findByVentureIdAndUserId(Long ventureId, Long userId);
}
