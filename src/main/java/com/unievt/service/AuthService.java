package com.unievt.service;

import com.unievt.dto.LoginRequestDTO;
import com.unievt.dto.LoginResponseDTO;
import com.unievt.dto.RefreshTokenRequestDTO;
import com.unievt.dto.RegisterRequestDTO;
import com.unievt.dto.UtilisateurCreateDTO;
import com.unievt.entity.RefreshToken;
import com.unievt.security.CustomUserDetails;
import com.unievt.security.JwtTokenProvider;
import com.unievt.security.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final UserDetailsServiceImpl userDetailsService;
    private final UtilisateurService utilisateurService;

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
                .build();
    }

    public LoginResponseDTO register(RegisterRequestDTO dto) {
        // Create the account with no permission role (public self-registration)
        utilisateurService.creer(UtilisateurCreateDTO.builder()
                .nom(dto.getNom())
                .prenom(dto.getPrenom())
                .email(dto.getEmail())
                .motDePasse(dto.getMotDePasse())
                .telephone(dto.getTelephone())
                .build());

        // Auto-login: the plaintext password is still in scope here
        return login(new LoginRequestDTO(dto.getEmail(), dto.getMotDePasse()));
    }

    public void logout(Long utilisateurId) {
        refreshTokenService.revokeAllUserTokens(utilisateurId);
    }
}
