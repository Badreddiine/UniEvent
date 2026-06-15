package com.unievt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.data.web.config.EnableSpringDataWebSupport;

import static org.springframework.data.web.config.EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO;

@SpringBootApplication(exclude = { SecurityAutoConfiguration.class })
// Sérialise les Page<> via un DTO stable ({ content, page }) au lieu du
// PageImpl brut (déprécié en Spring Boot 3.3+) — JSON cohérent et durable.
@EnableSpringDataWebSupport(pageSerializationMode = VIA_DTO)
public class UniEventBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(UniEventBackendApplication.class, args);
    }

}
