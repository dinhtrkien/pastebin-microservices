package com.tuankien03.pastebin.service.impl;

import com.tuankien03.pastebin.entity.Analytic;
import com.tuankien03.pastebin.entity.request.AnalyticUpsertRequest;
import com.tuankien03.pastebin.repository.AnalyticRepository;
import com.tuankien03.pastebin.service.AnalyticService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Data
@RequiredArgsConstructor
public class AnalyticServiceImpl implements AnalyticService {
    private final AnalyticRepository analyticRepository;

    @Override
    public void save(Analytic analytic) {
        analytic.setDateBucket(LocalDateTime.now().toLocalDate().atStartOfDay());
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

    @Override
    public void increaseView(AnalyticUpsertRequest pasteId) {
        LocalDateTime now = LocalDateTime.now().toLocalDate().atStartOfDay();
        Analytic analytic = analyticRepository.findByPasteIdAndDateBucket(pasteId.getPasteId(), now);
        if (analytic == null) {
            analytic = new Analytic();
            analytic.setPasteId(pasteId.getPasteId());
            analytic.setDateBucket(now);
            analytic.setViews(1);
            analyticRepository.save(analytic);
        } else {
            analytic.setViews(analytic.getViews() + 1);
            analyticRepository.save(analytic);
        }
    }

    @Override
    public void upsertAnalytic(AnalyticUpsertRequest request) {
    }
}
