package com.tuankien03.analytic.repository;

import com.tuankien03.analytic.entity.Analytic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnalyticRepository extends JpaRepository<Analytic, Integer> {
    List<Analytic> findAllByPasteId(Integer id);
    void deleteByPasteIdIn(List<Integer> pasteIds);
    Analytic findByPasteIdAndDateBucket(Integer pasteId, LocalDate dateBucket);
    @Modifying
    @Transactional
    @Query(value = """
        INSERT INTO analytic ("pasteId", "dateBucket", views)
        VALUES (:pasteId, :dateBucket, :views)
        ON CONFLICT ("pasteId", "dateBucket")
        DO UPDATE SET views = analytic.views + EXCLUDED.views
        """, nativeQuery = true)
    void upsertViews(@Param("pasteId") int pasteId,
                     @Param("dateBucket") LocalDate dateBucket,
                     @Param("views") int views);

    List<Analytic> findAllByPasteIdAndDateBucketBetween(Integer pasteId, LocalDate dateBucketAfter, LocalDate dateBucketBefore);
}