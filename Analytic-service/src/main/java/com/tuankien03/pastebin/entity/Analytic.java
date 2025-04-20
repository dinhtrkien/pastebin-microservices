package com.tuankien03.pastebin.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "analytic", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"paste_id", "date_bucket"}, name = "pasteId_dateBucket_unique")
})
public class Analytic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "date_bucket", nullable = false)
    private LocalDateTime dateBucket;

    @Column(nullable = false)
    private Integer views = 0;

    @Column(name = "paste_id", nullable = false, insertable = false, updatable = false)
    private Integer pasteId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paste_id", referencedColumnName = "id")
    private Paste paste;

}
