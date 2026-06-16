package com.unievt.service;

import com.unievt.dto.LoginRequestDTO;
import com.unievt.dto.LoginResponseDTO;
import com.unievt.dto.RefreshTokenRequestDTO;
import com.unievt.dto.RegisterRequestDTO;
import com.unievt.dto.RegisterResponseDTO;
import com.unievt.dto.UtilisateurCreateDTO;
import com.unievt.entity.RefreshToken;
import com.unievt.entity.Utilisateur;
import com.unievt.repository.UtilisateurRepository;
import com.unievt.security.CustomUserDetails;
import com.unievt.security.JwtTokenProvider;
import com.unievt.security.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final UserDetailsServiceImpl userDetailsService;
    private final UtilisateurService utilisateurService;
    private final UtilisateurRepository utilisateurRepository;
    private final EmailService emailService;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    public LoginResponseDTO login(LoginRequestDTO dto) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getMotDePasse()));
        } catch (BadCredentialsException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou mot de passe incorrect");
        }

        CustomUserDetails userDetails = (CustomUserDetails) userDetailsService.loadUserByUsername(dto.getEmail());
        String accessToken = jwtTokenProvider.generateAccessToken(userDetails);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());

        return LoginResponseDTO.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .userId(userDetails.getId())
                .email(userDetails.getUsername())
                .role(userDetails.getRole() != null ? userDetails.getRole().name() : "USER")
                .emailVerified(userDetails.getEmailVerified() != null && userDetails.getEmailVerified())
                .build();
    }

    public LoginResponseDTO refresh(RefreshTokenRequestDTO dto) {
        RefreshToken rt = refreshTokenService.findByToken(dto.getRefreshToken());
        refreshTokenService.verifyExpiration(rt);

        CustomUserDetails userDetails = (CustomUserDetails) userDetailsService
                .loadUserByUsername(rt.getUtilisateur().getEmail());

        String accessToken = jwtTokenProvider.generateAccessToken(userDetails);
        RefreshToken newRt = refreshTokenService.createRefreshToken(userDetails.getId());

        return LoginResponseDTO.builder()
                .accessToken(accessToken)
                .refreshToken(newRt.getToken())
                .userId(userDetails.getId())
                .email(userDetails.getUsername())
                .role(userDetails.getRole() != null ? userDetails.getRole().name() : "USER")
                .emailVerified(userDetails.getEmailVerified() != null && userDetails.getEmailVerified())
                .build();
    }

    @Transactional
    public RegisterResponseDTO register(RegisterRequestDTO dto) {
        // Create the account with no permission role (public self-registration).
        // creer() handles uniqueness check + password hashing.
        utilisateurService.creer(UtilisateurCreateDTO.builder()
                .nom(dto.getNom())
                .prenom(dto.getPrenom())
                .email(dto.getEmail())
                .motDePasse(dto.getMotDePasse())
                .telephone(dto.getTelephone())
                .build());

        // The account stays disabled until the email is verified.
        Utilisateur user = utilisateurRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Compte introuvable après création"));

        String token = UUID.randomUUID().toString();
        user.setActif(false);
        user.setEmailVerified(false);
        user.setVerificationToken(token);
        user.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24));
        utilisateurRepository.save(user);

        String verificationLink = frontendUrl + "/auth/verify-email?token=" + token;
        emailService.sendVerificationEmail(
                user.getEmail(), user.getPrenom() + " " + user.getNom(), verificationLink);

        // No auto-login: the user must verify their email first.
        return RegisterResponseDTO.builder()
                .message("Compte créé. Vérifiez votre email pour activer votre compte.")
                .build();
    }

    @Transactional
    public RegisterResponseDTO resendVerification(String email) {
        Utilisateur user = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Aucun compte associé à cet email"));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email déjà vérifié");
        }

        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);
        user.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24));
        utilisateurRepository.save(user);

        String verificationLink = frontendUrl + "/auth/verify-email?token=" + token;
        emailService.sendVerificationEmail(
                user.getEmail(), user.getPrenom() + " " + user.getNom(), verificationLink);

        return RegisterResponseDTO.builder()
                .message("Email de vérification renvoyé")
                .build();
    }

    @Transactional
    public LoginResponseDTO verifyEmail(String token) {
        Utilisateur user = utilisateurRepository.findByVerificationToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Token de vérification invalide"));

        if (user.getVerificationTokenExpiry() == null
                || user.getVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Token de vérification expiré");
        }

        user.setActif(true);
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
        utilisateurRepository.save(user);

        CustomUserDetails userDetails =
                (CustomUserDetails) userDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = jwtTokenProvider.generateAccessToken(userDetails);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());

        return LoginResponseDTO.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .userId(userDetails.getId())
                .email(userDetails.getUsername())
                .role(userDetails.getRole() != null ? userDetails.getRole().name() : "USER")
                .emailVerified(true)
                .build();
    }

    public void logout(Long utilisateurId) {
        refreshTokenService.revokeAllUserTokens(utilisateurId);
    }
}
