package com.tuankien03.pastebin.repository;

import com.tuankien03.pastebin.entity.Analytic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnalyticRepository extends JpaRepository<Analytic, Integer> {
    List<Analytic> findAllByPasteId(Integer id);
    void deleteByPasteIdIn(List<Integer> pasteIds);
    Analytic findByPasteIdAndDateBucket(Integer pasteId, LocalDateTime dateBucket);
}
