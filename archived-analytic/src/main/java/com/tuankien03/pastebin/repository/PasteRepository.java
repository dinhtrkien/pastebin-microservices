package com.tuankien03.pastebin.repository;

import com.tuankien03.pastebin.entity.Paste;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PasteRepository extends JpaRepository<Paste, Integer> {
    List<Paste> findTop1000ByExpirationTimeBeforeAndExpirationTimeIsNotNull(LocalDateTime now);
}
