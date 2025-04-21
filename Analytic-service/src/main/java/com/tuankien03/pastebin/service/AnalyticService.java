package com.tuankien03.pastebin.service;

import com.tuankien03.pastebin.entity.Analytic;
import java.time.LocalDateTime;
import com.tuankien03.pastebin.entity.request.AnalyticUpsertRequest;

import java.util.List;

public interface AnalyticService extends BaseService<Analytic> {
    List<Analytic> findAllByPasteId(Integer pasteId);
    void increaseView(AnalyticUpsertRequest pasteId);
    void upsertAnalytic(AnalyticUpsertRequest request);
}
