package com.tuankien03.analytic.service.impl;

import com.tuankien03.analytic.repository.AnalyticRepository;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticFlushService {

    private final RedisTemplate<String, String> redisTemplate;
    private final AnalyticRepository analyticRepository;

    public AnalyticFlushService(RedisTemplate<String, String> redisTemplate,
                                AnalyticRepository analyticRepository) {
        this.redisTemplate = redisTemplate;
        this.analyticRepository = analyticRepository;
    }

    @Scheduled(fixedDelay = 30000)
    public void flushViewsFromRedis() {
        String cursor = "0";
        Map<String, Integer> aggregated = new HashMap<>();

        ScanOptions options = ScanOptions.scanOptions().match("paste:*").count(5000).build();
        Cursor<byte[]> scan = redisTemplate.getConnectionFactory().getConnection().scan(options);

        List<String> keys = new ArrayList<>();
        scan.forEachRemaining(keyBytes -> {
            String key = new String(keyBytes, StandardCharsets.UTF_8);
            keys.add(key);
        });

        // Fake GETDEL — vì Redis <7 không hỗ trợ GETDEL, ta dùng GET → DEL
        for (String key : keys) {
            String value = redisTemplate.opsForValue().get(key);
            redisTemplate.delete(key);

            if (value == null) continue;
            int views = Integer.parseInt(value);

            String[] parts = key.split(":");
            if (parts.length != 3) continue;

            String pasteId = parts[1];
            String date = parts[2];

            String mapKey = pasteId + "|" + date;
            aggregated.put(mapKey, aggregated.getOrDefault(mapKey, 0) + views);
        }

        // Flush vào DB
        for (Map.Entry<String, Integer> entry : aggregated.entrySet()) {
            String[] parts = entry.getKey().split("\\|");
            int pasteId = Integer.parseInt(parts[0]);
            LocalDate dateBucket = LocalDate.parse(parts[1], DateTimeFormatter.BASIC_ISO_DATE);
            int views = entry.getValue();

            analyticRepository.upsertViews(pasteId, dateBucket, views);
        }
    }
}

