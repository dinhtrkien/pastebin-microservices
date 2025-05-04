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

    @Scheduled(cron = "0 0 0 * * *")
    public void scheduledCleanup() {
        log.info("⏰ Running scheduled cleanup at midnight...");
        cleanupService.cleanup();
    }
}
