package com.tuankien03.analyticworker.service;

import com.tuankien03.analyticworker.repository.AnalyticRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticFlushService {

    private final StringRedisTemplate redisTemplate;
    private final AnalyticRepository analyticRepository;

    private static final int FLUSH_BATCH_SIZE = 5000;
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");

    @Scheduled(fixedDelay = 30000) // Flush every 30 seconds
    @Transactional
    public void flush() {
        log.info("📦 Starting flush from Redis to DB...");

        Cursor<byte[]> cursor = redisTemplate.getConnectionFactory().getConnection()
                .scan(ScanOptions.scanOptions().match("paste:*:*:*").count(FLUSH_BATCH_SIZE).build());

        Map<String, Integer> viewMap = new HashMap<>();

        while (cursor.hasNext()) {
            String key = new String(cursor.next());
            String[] parts = key.split(":");
            if (parts.length != 4) continue;

            String slug = parts[1];
            String dateString = parts[2];
            int pasteId;

            try {
                pasteId = Integer.parseInt(parts[3]);
            } catch (NumberFormatException e) {
                log.warn("Invalid pasteId in key {}", key);
                continue;
            }

            String value = redisTemplate.opsForValue().getAndDelete(key);
            if (value == null) continue;

            int views;
            try {
                views = Integer.parseInt(value);
            } catch (NumberFormatException e) {
                log.warn("Invalid view count for key {}: {}", key, value);
                continue;
            }

            String compositeKey = slug + ":" + dateString + ":" + pasteId;
            viewMap.merge(compositeKey, views, Integer::sum);
        }

        for (Map.Entry<String, Integer> entry : viewMap.entrySet()) {
            String[] parts = entry.getKey().split(":");
            String slug = parts[0];
            LocalDate dateBucket = LocalDate.parse(parts[1], DATE_FORMAT);
            int pasteId = Integer.parseInt(parts[2]);
            int views = entry.getValue();

            analyticRepository.upsertBySlugAndDate(slug, dateBucket, views, pasteId);
        }

        log.info("✅ Flushed {} analytics entries.", viewMap.size());
    }
}
