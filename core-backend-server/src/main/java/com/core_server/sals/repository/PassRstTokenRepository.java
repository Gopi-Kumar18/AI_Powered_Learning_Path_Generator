package com.core_server.sals.repository;
import com.core_server.sals.model.PassResetToken;
import com.core_server.sals.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

    public interface PassRstTokenRepository extends JpaRepository<PassResetToken, Long> {
        Optional<PassResetToken> findByToken(String token);
        void deleteByUser(User user);
    }
