package com.unievt.exception;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

/**
 * Centralised error handling.
 *
 * <p>Without these handlers, business exceptions thrown inside services bubble
 * out of the DispatcherServlet and are caught by Spring Security's
 * {@code ExceptionTranslationFilter}, which turns them into a misleading
 * <b>403 Forbidden</b>. Resolving them here keeps the response codes correct.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ConflictException.class)
    public ProblemDetail handleConflict(ConflictException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
    }

    /** Preserve the status carried by a ResponseStatusException (e.g. 404, 409, 401). */
    @ExceptionHandler(ResponseStatusException.class)
    public ProblemDetail handleResponseStatus(ResponseStatusException ex) {
        return ProblemDetail.forStatusAndDetail(ex.getStatusCode(),
                ex.getReason() != null ? ex.getReason() : ex.getMessage());
    }

    /** Duplicate key / unique constraint violations → 409 Conflict. */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ProblemDetail handleDataIntegrity(DataIntegrityViolationException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT,
                "Conflit de données : la ressource existe déjà ou viole une contrainte d'unicité.");
    }

    /** Concurrent update of the same row (e.g. double badge generation) → 409 Conflict. */
    @ExceptionHandler(OptimisticLockingFailureException.class)
    public ProblemDetail handleOptimisticLock(OptimisticLockingFailureException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT,
                "La ressource a été modifiée simultanément. Réessayez.");
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ProblemDetail handleNotFound(EntityNotFoundException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(f -> f.getField() + " : " + f.getDefaultMessage())
                .orElse("Requête invalide");
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, msg);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail handleIllegalArgument(IllegalArgumentException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    /**
     * A disabled account (email not yet verified) → 401 with a message the
     * frontend can detect to show the "verify your email" prompt.
     */
    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<Map<String, String>> handleDisabled(DisabledException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Veuillez vérifier votre adresse email avant de vous connecter."));
    }

    /** A genuine authorization denial stays a 403 — but with a JSON body. */
    @ExceptionHandler(AccessDeniedException.class)
    public ProblemDetail handleAccessDenied(AccessDeniedException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN,
                "Accès refusé : vous n'avez pas les droits nécessaires.");
    }
}
