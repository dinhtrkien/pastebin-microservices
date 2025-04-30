package com.tuankien03.pastebin.service.impl;

import com.tuankien03.pastebin.entity.Paste;
import com.tuankien03.pastebin.repository.PasteRepository;
import com.tuankien03.pastebin.service.PasteService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;


@Service
@Data
@RequiredArgsConstructor
public class PasteServiceImpl implements PasteService {
    private final PasteRepository pasteRepository;

    @Override
    public void save(Paste paste) {
        pasteRepository.save(paste);
    }

    @Override
    public void delete(Integer id) {
        pasteRepository.deleteById(id);
    }

    @Override
    public Paste findById(Integer id) {
        return pasteRepository.findById(id).orElse(null);
    }

    @Override
    public Page<Paste> findAll(Pageable pageable) {
        return pasteRepository.findAll(pageable);
    }
}
