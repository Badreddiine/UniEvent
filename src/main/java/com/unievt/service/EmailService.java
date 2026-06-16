package com.unievt.service;

import com.unievt.enums.NotificationTypeEnum;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username:noreply@unievt.ma}")
    private String fromAddress;

    @Async("emailTaskExecutor")
    public void sendNotificationEmail(String toEmail, String subject,
                                       NotificationTypeEnum type, Map<String, Object> vars) {
        try {
            String templateName = resolveTemplate(type);
            Context ctx = new Context();
            vars.forEach(ctx::setVariable);

            String html = templateEngine.process(templateName, ctx);

            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(html, true);

            mailSender.send(msg);
            log.debug("Email sent to {} for type {}", toEmail, type);
        } catch (MessagingException e) {
            log.error("Failed to send email to {} for type {}: {}", toEmail, type, e.getMessage());
        }
    }

    /**
     * Sends the account-verification email containing the activation link.
     * Rendered from the {@code email/verify-email} Thymeleaf template.
     */
    @Async("emailTaskExecutor")
    public void sendVerificationEmail(String toEmail, String userName, String verificationLink) {
        try {
            Context ctx = new Context();
            ctx.setVariable("userName", userName);
            ctx.setVariable("verificationLink", verificationLink);

            String html = templateEngine.process("email/verify-email", ctx);

            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("Vérifiez votre adresse email — UniEvent");
            helper.setText(html, true);

            mailSender.send(msg);
            log.debug("Verification email sent to {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send verification email to {}: {}", toEmail, e.getMessage());
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
