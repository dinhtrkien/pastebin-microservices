package com.tuankien03.analytic.service.impl;

import com.tuankien03.analytic.entity.Analytic;
import com.tuankien03.analytic.repository.AnalyticRepository;
import com.tuankien03.analytic.service.AnalyticService;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
@Data
public class AnalyticServiceImpl implements AnalyticService {
    private final AnalyticRepository analyticRepository;

    @Override
    public List<Analytic> findAllBySlugAndFilter(String slug, LocalDate startDate, LocalDate endDate) {
        return analyticRepository.findAllBySlugAndDateBucketBetween(
                slug,
                startDate,
                endDate
         );
    }

    @Override
    public List<Analytic> findAllByPasteId(Integer pasteId) {
        return analyticRepository.findAllByPasteId(pasteId);
    }

    @Override
    public void updateViewCount() {

    }

    @Override
    public void save(Analytic analytic) {
        analyticRepository.save(analytic);
    }

    @Override
    public void delete(Integer id) {
        analyticRepository.deleteById(id);
    }

    @Override
    public Analytic findById(Integer id) {
        return analyticRepository.findById(id).orElse(null);
    }

    @Override
    public Page<Analytic> findAll(Pageable pageable) {
        return analyticRepository.findAll(pageable);
    }
}
