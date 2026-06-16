package com.unievt.service;

import com.unievt.enums.NotificationTypeEnum;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    private final TemplateEngine templateEngine;
    private final RestTemplate restTemplate;

    @Value("${brevo.api.key:}")
    private String brevoApiKey;

    @Value("${brevo.sender.email:aed4bc001@smtp-brevo.com}")
    private String senderEmail;

    @Value("${brevo.sender.name:UniEvent}")
    private String senderName;

    @Async("emailTaskExecutor")
    public void sendNotificationEmail(String toEmail, String subject,
                                       NotificationTypeEnum type, Map<String, Object> vars) {
        String templateName = resolveTemplate(type);
        Context ctx = new Context();
        vars.forEach(ctx::setVariable);
        String html = templateEngine.process(templateName, ctx);

        send(toEmail, subject, html);
    }

    /**
     * Sends the account-verification email containing the activation link.
     * Rendered from the {@code email/verify-email} Thymeleaf template.
     */
    @Async("emailTaskExecutor")
    public void sendVerificationEmail(String toEmail, String userName, String verificationLink) {
        Context ctx = new Context();
        ctx.setVariable("userName", userName);
        ctx.setVariable("verificationLink", verificationLink);
        String html = templateEngine.process("email/verify-email", ctx);

        send(toEmail, "Vérifiez votre adresse email — UniEvent", html);
    }

    // ── Brevo REST transport ──────────────────────────────────────────────────

    /**
     * Sends an HTML email through the Brevo transactional email REST API.
     * POST https://api.brevo.com/v3/smtp/email
     */
    private void send(String toEmail, String subject, String htmlContent) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        headers.set("api-key", brevoApiKey);

        Map<String, Object> body = Map.of(
                "sender", Map.of("email", senderEmail, "name", senderName),
                "to", List.of(Map.of("email", toEmail)),
                "subject", subject,
                "htmlContent", htmlContent
        );

        try {
            restTemplate.postForEntity(BREVO_API_URL, new HttpEntity<>(body, headers), String.class);
            log.debug("Email sent to {} via Brevo", toEmail);
        } catch (RestClientException e) {
            log.error("Failed to send email to {} via Brevo: {}", toEmail, e.getMessage());
        }
    }

    private String resolveTemplate(NotificationTypeEnum type) {
        return switch (type) {
            case REGISTRATION_CONFIRMED -> "email/registration-confirmed";
            case EVENT_REMINDER         -> "email/event-reminder";
            case EVENT_CANCELLED        -> "email/event-cancelled";
            case WAITLIST_PROMOTED      -> "email/waitlist-promoted";
            case BADGE_ISSUED           -> "email/badge-issued";
        };
    }
}
