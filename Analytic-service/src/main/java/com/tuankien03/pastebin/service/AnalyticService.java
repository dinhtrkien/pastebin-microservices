package com.tuankien03.pastebin.service;

import com.tuankien03.pastebin.entity.Analytic;

import java.util.List;

public interface AnalyticService extends BaseService<Analytic> {
    List<Analytic> findAllByPasteId(Integer pasteId);
}
