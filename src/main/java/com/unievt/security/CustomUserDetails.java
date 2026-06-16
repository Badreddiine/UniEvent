package com.unievt.security;

import com.unievt.entity.Utilisateur;
import com.unievt.enums.RoleEnum;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class CustomUserDetails implements UserDetails {

    private final Utilisateur utilisateur;

    public CustomUserDetails(Utilisateur utilisateur) {
        this.utilisateur = utilisateur;
    }

    public Long getId() {
        return utilisateur.getId();
    }

    public RoleEnum getRole() {
        return utilisateur.getRole();
    }

    public Boolean getEmailVerified() {
        return utilisateur.getEmailVerified();
    }

    @Override
    public String getUsername() {
        return utilisateur.getEmail();
    }

    @Override
    public String getPassword() {
        return utilisateur.getMotDePasse();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String authority = utilisateur.getRole() != null
                ? "ROLE_" + utilisateur.getRole().name()
                : "ROLE_USER";
        return List.of(new SimpleGrantedAuthority(authority));
    }

    @Override
    public boolean isEnabled() {
        return utilisateur.getActif() != null && utilisateur.getActif();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
}
