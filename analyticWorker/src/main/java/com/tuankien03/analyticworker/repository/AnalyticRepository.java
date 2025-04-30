package com.tuankien03.analyticworker.repository;

import com.tuankien03.analyticworker.entity.Analytic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AnalyticRepository extends JpaRepository<Analytic, Integer> {

    @Modifying
    @Transactional
    @Query(value = """
    INSERT INTO "Analytics" ("slug", "dateBucket", "views", "pasteId")
    VALUES (:slug, :dateBucket, :views, :pasteId)
    ON CONFLICT ("slug", "dateBucket")
    DO UPDATE SET "views" = "Analytics"."views" + EXCLUDED."views"
""", nativeQuery = true)
    void upsertBySlugAndDate(
            @Param("slug") String slug,
            @Param("dateBucket") LocalDate dateBucket,
            @Param("views") int views,
            @Param("pasteId") int pasteId
    );

}