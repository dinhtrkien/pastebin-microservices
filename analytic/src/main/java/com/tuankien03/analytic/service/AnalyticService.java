package com.tuankien03.analytic.service;

import com.tuankien03.analytic.entity.Analytic;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface AnalyticService extends BaseService<Analytic> {
    List<Analytic> findAllByPasteIdAndFilter(Integer pasteId, LocalDate startDate, LocalDate endDate);
    List<Analytic> findAllByPasteId(Integer pasteId);
    void updateViewCount();
}
