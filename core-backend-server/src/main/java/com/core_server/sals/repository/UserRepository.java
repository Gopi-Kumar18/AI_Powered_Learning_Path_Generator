package com.core_server.sals.repository;


import com.core_server.sals.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;


public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByCustomId(String userId);
}