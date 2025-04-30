package com.tuankien03.analytic.service;

import com.tuankien03.analytic.entity.Analytic;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface AnalyticService extends BaseService<Analytic> {
    List<Analytic> findAllBySlugAndFilter(String slug, LocalDate startDate, LocalDate endDate);
    List<Analytic> findAllByPasteId(Integer pasteId);
    void updateViewCount();
}
