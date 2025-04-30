package com.tuankien03.cleanup.service.impl;

import com.tuankien03.cleanup.service.CleanupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class CleanupScheduler {
    private final CleanupService cleanupService;

    // 🕛 Chạy mỗi ngày lúc 12:00 đêm (00:00)
    @Scheduled(cron = "0 0 0 * * *")  // Giờ phút giây, ngày, tháng, thứ
    public void scheduledCleanup() {
        log.info("⏰ Running scheduled cleanup at midnight...");
        cleanupService.cleanup();
    }
}
