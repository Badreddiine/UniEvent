package com.unievt.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    private static final String BEARER_SCHEME = "Bearer Authentication";

    /** Base URL advertised in the OpenAPI document. Configurable per environment. */
    @Value("${app.openapi.server-url}")
    private String serverUrl;

    @Bean
    public OpenAPI uniEventOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("UniEvent API")
                        .description("""
                                **UniEvent** backend REST API.

                                Authentication: obtain a JWT via `POST /api/auth/login` or `POST /api/auth/register`,
                                then pass `Authorization: Bearer <token>` on every secured request.
                                Use the **Authorize** button (🔒) to set the token globally in this UI.
                                """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("UniEvent Team")
                                .email("dev@unievt.ma"))
                        .license(new License()
                                .name("MIT")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server()
                                .url(serverUrl)
                                .description("API server")))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_SCHEME))
                .components(new Components()
                        .addSecuritySchemes(BEARER_SCHEME, new SecurityScheme()
                                .name(BEARER_SCHEME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Paste your JWT access token here (without the 'Bearer ' prefix)")));
    }
}
