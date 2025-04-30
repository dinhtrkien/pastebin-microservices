package com.tuankien03.pastebin.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "\"Analytics\"", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"pasteId", "dateBucket"}, name = "Analytics_pasteId_dateBucket_key")
})
@Data
public class Analytic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "\"dateBucket\"", nullable = false)
    private LocalDateTime dateBucket;

    @Column(nullable = false)
    private Integer views = 0;

    @Column(name = "\"pasteId\"", nullable = false)
    private Integer pasteId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "\"pasteId\"", referencedColumnName = "id", insertable = false, updatable = false)
    @JsonBackReference
    private Paste paste;
}
