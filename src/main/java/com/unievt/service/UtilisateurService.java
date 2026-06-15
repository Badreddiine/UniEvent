package com.unievt.service;

import com.unievt.dto.UpdateMeDTO;
import com.unievt.dto.UserDTO;
import com.unievt.dto.UtilisateurCreateDTO;
import com.unievt.dto.UtilisateurResponseDTO;
import com.unievt.dto.UtilisateurUpdateDTO;
import com.unievt.entity.Utilisateur;
import com.unievt.enums.RoleEnum;
import com.unievt.mapper.UtilisateurMapper;
import com.unievt.repository.ClubRepository;
import com.unievt.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final UtilisateurMapper utilisateurMapper;
    private final PasswordEncoder passwordEncoder;
    private final ClubRepository clubRepository;

    public UtilisateurResponseDTO creer(UtilisateurCreateDTO dto) {
        if (utilisateurRepository.existsByEmail(dto.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Un utilisateur avec cet email existe déjà");
        }
        Utilisateur entity = utilisateurMapper.toEntity(dto);
        entity.setMotDePasse(passwordEncoder.encode(dto.getMotDePasse()));
        if (entity.getActif() == null) {
            entity.setActif(true);
        }
        // Rôle par défaut à la création (inscription publique) : ETUDIANT
        if (entity.getRole() == null) {
            entity.setRole(RoleEnum.ETUDIANT);
        }
        Utilisateur saved = utilisateurRepository.save(entity);
        return utilisateurMapper.toResponseDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<UtilisateurResponseDTO> lister() {
        return utilisateurRepository.findAll().stream()
                .map(utilisateurMapper::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<UserDTO> listerPage(Pageable pageable) {
        return utilisateurRepository.findAll(pageable)
                .map(utilisateurMapper::toUserDTO);
    }

    @Transactional(readOnly = true)
    public UtilisateurResponseDTO lire(Long id) {
        return utilisateurMapper.toResponseDTO(getOrThrow(id));
    }

    public UtilisateurResponseDTO modifier(Long id, UtilisateurUpdateDTO dto) {
        Utilisateur entity = getOrThrow(id);
        utilisateurMapper.updateEntityFromDTO(dto, entity);
        return utilisateurMapper.toResponseDTO(utilisateurRepository.save(entity));
    }

    public UserDTO modifierMe(Long id, UpdateMeDTO dto) {
        Utilisateur entity = getOrThrow(id);
        utilisateurMapper.updateEntityFromUpdateMeDTO(dto, entity);
        return utilisateurMapper.toUserDTO(utilisateurRepository.save(entity));
    }

    @Transactional(readOnly = true)
    public UserDTO lireAsUserDTO(Long id) {
        UserDTO dto = utilisateurMapper.toUserDTO(getOrThrow(id));
        dto.setPresidentDeClub(clubRepository.existsByPresidentId(id));
        return dto;
    }

    public UtilisateurResponseDTO activer(Long id) {
        return setActif(id, true);
    }

    public UtilisateurResponseDTO desactiver(Long id) {
        return setActif(id, false);
    }

    private UtilisateurResponseDTO setActif(Long id, boolean actif) {
        Utilisateur entity = getOrThrow(id);
        entity.setActif(actif);
        return utilisateurMapper.toResponseDTO(utilisateurRepository.save(entity));
    }

    public UtilisateurResponseDTO changerEmail(Long id, String nouveauEmail) {
        if (nouveauEmail == null || nouveauEmail.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Le nouvel email est obligatoire");
        }
        Utilisateur entity = getOrThrow(id);
        // idempotent: setting the same email again is a no-op rather than a conflict
        if (!nouveauEmail.equals(entity.getEmail())
                && utilisateurRepository.existsByEmail(nouveauEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cet email est déjà utilisé");
        }
        // TODO: en prod, envoyer un lien de confirmation au nouvel email avant de persister.
        entity.setEmail(nouveauEmail);
        return utilisateurMapper.toResponseDTO(utilisateurRepository.save(entity));
    }

    public UtilisateurResponseDTO changerRole(Long id, RoleEnum nouveauRole) {
        // null is allowed: setting role=null demotes a user back to "no special permission".
        Utilisateur entity = getOrThrow(id);
        entity.setRole(nouveauRole);
        return utilisateurMapper.toResponseDTO(utilisateurRepository.save(entity));
    }

    public void supprimer(Long id) {
        if (!utilisateurRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Utilisateur introuvable: " + id);
        }
        utilisateurRepository.deleteById(id);
    }

    private Utilisateur getOrThrow(Long id) {
        return utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Utilisateur introuvable: " + id));
    }
}
