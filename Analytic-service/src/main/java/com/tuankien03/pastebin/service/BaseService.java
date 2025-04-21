package com.tuankien03.pastebin.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BaseService<T> {
        void save(T t);
        void delete(Integer id);
        T findById(Integer id);
        Page<T> findAll(Pageable pageable);
}
