package com.tuankien03.analytic.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "\"Paste\"", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"slug"}, name = "Paste_slug_key")
})
@Data
public class Paste {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(nullable = false, unique = true)
    private String slug;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    @Column(name = "\"createdAt\"", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    @Column(name = "\"expirationTime\"")
    private LocalDateTime expirationTime;
    @OneToMany(mappedBy = "paste", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Analytic> analytics;
}
