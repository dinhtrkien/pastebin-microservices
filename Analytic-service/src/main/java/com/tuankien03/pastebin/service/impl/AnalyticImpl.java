package com.tuankien03.pastebin.service.impl;

import com.tuankien03.pastebin.entity.Analytic;
import com.tuankien03.pastebin.repository.AnalyticRepository;
import com.tuankien03.pastebin.service.AnalyticService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Data
@RequiredArgsConstructor
public class AnalyticImpl implements AnalyticService {
    private AnalyticRepository analyticRepository;

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

    @Override
    public List<Analytic> findAllByPasteId(Integer pasteId) {
        return analyticRepository.findAllByPasteId(pasteId);
    }
}
