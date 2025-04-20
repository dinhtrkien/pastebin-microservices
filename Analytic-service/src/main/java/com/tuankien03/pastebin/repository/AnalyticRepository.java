package com.tuankien03.pastebin.repository;

import com.tuankien03.pastebin.entity.Analytic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnalyticRepository extends JpaRepository<Analytic, Integer> {
    List<Analytic> findAllByPasteId(Integer id);
    void deleteByPasteIdIn(List<Integer> pasteIds);

}
