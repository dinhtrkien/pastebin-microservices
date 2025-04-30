package com.tuankien03.analyticworker.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "\"Analytics\"", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"\"slug\"", "\"dateBucket\""}, name = "ux_analytics_slug_datebucket")
})
@Data
public class Analytic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "\"dateBucket\"", nullable = false)
    private LocalDate dateBucket;

    @Column(nullable = false)
    private Integer views = 0;

    @Column(name = "\"slug\"", nullable = false)
    private String slug = "";

    @Column(name = "\"pasteId\"", nullable = false)
    private Integer pasteId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "\"pasteId\"", referencedColumnName = "id", insertable = false, updatable = false)
    @JsonBackReference
    private Paste paste;
}
