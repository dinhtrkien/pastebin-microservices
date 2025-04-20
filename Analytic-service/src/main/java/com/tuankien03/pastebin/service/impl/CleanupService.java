package com.tuankien03.pastebin.service.impl;

import com.tuankien03.pastebin.entity.Paste;
import com.tuankien03.pastebin.repository.AnalyticRepository;
import com.tuankien03.pastebin.repository.PasteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CleanupService {

    private final PasteRepository pasteRepository;
    private final AnalyticRepository analyticRepository;

    private static final int BATCH_SIZE = 1000;
    private static final int BATCH_DELAY_MS = 1000;

    private boolean isRunning = false;

    /**
     * Tự động chạy lúc 0h00 mỗi ngày
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void scheduledCleanup() {
        cleanupExpiredPastes();
    }

    /**
     * Thực thi ngay lập tức
     */
    public void runNow() {
        cleanupExpiredPastes();
    }

    /**
     * Dọn dẹp các Paste hết hạn
     */
    @Transactional
    public void cleanupExpiredPastes() {
        if (isRunning) {
            log.info("Cleanup is already running, skipping...");
            return;
        }

        try {
            isRunning = true;
            log.info("Starting cleanup of expired pastes...");

            LocalDateTime now = LocalDateTime.now();
            int totalDeleted = 0;
            int batchCount = 0;
            boolean hasMore = true;

            while (hasMore) {
                batchCount++;

                List<Paste> expiredPastes = pasteRepository.findTop1000ByExpirationTimeBeforeAndExpirationTimeIsNotNull(now);

                if (expiredPastes.isEmpty()) {
                    hasMore = false;
                    continue;
                }

                List<Integer> pasteIds = expiredPastes.stream()
                        .map(Paste::getId)
                        .collect(Collectors.toList());

                // Xóa analytics trước
                analyticRepository.deleteByPasteIdIn(pasteIds);

                // Xóa paste
                pasteRepository.deleteAllById(pasteIds);

                totalDeleted += pasteIds.size();
                log.info("Batch {}: Deleted {} expired pastes and their analytics", batchCount, pasteIds.size());

                if (expiredPastes.size() < BATCH_SIZE) {
                    hasMore = false;
                } else {
                    try {
                        Thread.sleep(BATCH_DELAY_MS);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        throw new RuntimeException("Cleanup interrupted", e);
                    }
                }
            }

            log.info("Cleanup completed: {} expired pastes deleted in {} batches", totalDeleted, batchCount);

        } catch (Exception e) {
            log.error("Error during paste cleanup", e);
            throw new RuntimeException("Error during cleanup", e);
        } finally {
            isRunning = false;
        }
    }
}

