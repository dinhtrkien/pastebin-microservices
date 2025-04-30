package com.tuankien03.analyticworker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class AnalyticWorkerApplication {

    public static void main(String[] args) {
        SpringApplication.run(AnalyticWorkerApplication.class, args);
    }

}
