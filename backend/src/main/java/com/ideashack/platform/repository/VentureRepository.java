package com.ideashack.platform.repository;

import com.ideashack.platform.model.Venture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VentureRepository extends JpaRepository<Venture, Long> {

    @Query("SELECT DISTINCT v FROM Venture v JOIN v.members m WHERE m.user.id = :userId ORDER BY v.updatedAt DESC")
    List<Venture> findByMemberId(@Param("userId") Long userId);
}
