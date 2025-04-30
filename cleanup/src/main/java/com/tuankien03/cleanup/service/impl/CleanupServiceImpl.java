package com.tuankien03.cleanup.service.impl;

import com.tuankien03.cleanup.entity.Paste;
import com.tuankien03.cleanup.repository.PasteRepository;
import com.tuankien03.cleanup.service.CleanupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class CleanupServiceImpl implements CleanupService {
    private final PasteRepository pasteRepository;

    @Override
    @Transactional
    public void cleanup() {
        log.info("Starting cleanup of expired pastes...");

        int totalDeleted = 0;
        List<Paste> expiredPastes = pasteRepository.findTop1000ByExpirationTimeBeforeAndExpirationTimeIsNotNull(LocalDateTime.now());

        while (!expiredPastes.isEmpty()) {
            int batchSize = expiredPastes.size();
            pasteRepository.deleteAll(expiredPastes);
            totalDeleted += batchSize;
            log.info("Deleted {} expired pastes in batch.", batchSize);

            expiredPastes = pasteRepository.findTop1000ByExpirationTimeBeforeAndExpirationTimeIsNotNull(LocalDateTime.now());
        }

        log.info("Cleanup complete. Total expired pastes deleted: {}", totalDeleted);
    }

}
