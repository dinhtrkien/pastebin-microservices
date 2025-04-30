package com.tuankien03.pastebin.controller;

import com.tuankien03.pastebin.entity.Paste;
import com.tuankien03.pastebin.service.PasteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/paste")
public class PasteController {
    private final PasteService pasteService;

    @GetMapping
    public ResponseEntity<Page<Paste>> getAll(
            @RequestParam(value = "page" , required = false, defaultValue = "1") int page,
            @RequestParam(value="size", required = false, defaultValue = "12") int size
    ) {
        Pageable pageable = PageRequest.of(page - 1, size);
        return ResponseEntity.ok(pasteService.findAll(pageable));
    }

    @PostMapping
    public void PostPaste(@RequestBody Paste paste) {
        pasteService.save(paste);
    }

    @DeleteMapping
    public void DeletePaste(@RequestBody Integer pasteId) {
        pasteService.delete(pasteId);
    }

}
