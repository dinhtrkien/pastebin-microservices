package com.tuankien03.pastebin.controller;

import com.tuankien03.pastebin.entity.Analytic;
import com.tuankien03.pastebin.entity.request.AnalyticUpsertRequest;
import com.tuankien03.pastebin.service.AnalyticService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Data
public class AnalyticController {
    private final AnalyticService analyticService;


    @GetMapping
    public ResponseEntity<List<Analytic>> findAllByPasteId(
            Integer pasteId
          ) {
        return ResponseEntity.ok(analyticService.findAllByPasteId(pasteId));
    }

    @PostMapping("/increment")
    public void increaseView(
            @RequestBody AnalyticUpsertRequest pasteId
            ) {
        analyticService.increaseView(pasteId);
    }

    @PostMapping
    public void save(@RequestBody Analytic analytic) {
        System.out.println(analytic);
        analyticService.save(analytic);
    }

    @DeleteMapping
    public void delete(@RequestBody Integer analyticId) {
        analyticService.delete(analyticId);
    }


}
