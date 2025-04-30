package com.tuankien03.analytic.controller;


import com.tuankien03.analytic.entity.Analytic;
import com.tuankien03.analytic.service.AnalyticService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticController {

    private final AnalyticService analyticService;

    @GetMapping("/paste/{slug}/timeline")
    public List<Analytic> getAnalyticByPasteAndDate(
            @PathVariable("slug") String slug,
            @RequestParam(value = "startDate", required = false) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) LocalDate endDate
    ) {
        startDate = (startDate == null) ? LocalDate.of(1970, 1, 1) : startDate;
        endDate = (endDate == null) ? LocalDate.now() : endDate;
        return analyticService.findAllBySlugAndFilter(slug, startDate, endDate);
    }
}
