package com.unievt.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI uniEventOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("UniEvent API")
                        .description("UniEvent backend API documentation")
                        .version("0.0.1"));
    }

}
