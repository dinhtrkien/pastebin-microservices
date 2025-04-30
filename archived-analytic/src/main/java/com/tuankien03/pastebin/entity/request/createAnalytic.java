package com.tuankien03.pastebin.entity.request;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class createAnalytic {
    private Integer pasteId;
    private LocalDateTime dateBucket;
}
