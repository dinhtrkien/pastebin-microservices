package com.tuankien03.cleanup;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class CleanupApplication {

    public static void main(String[] args) {
        SpringApplication.run(CleanupApplication.class, args);
    }

}
