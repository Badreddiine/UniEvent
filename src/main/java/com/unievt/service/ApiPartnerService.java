package com.unievt.service;

import com.unievt.dto.CreatePartnerRequest;
import com.unievt.dto.CreateSponsorRequest;
import com.unievt.dto.EventSponsorDto;
import com.unievt.dto.PartnerDto;
import com.unievt.entity.Evenement;
import com.unievt.entity.Partner;
import com.unievt.entity.Sponsor;
import com.unievt.exception.ConflictException;
import com.unievt.repository.EvenementRepository;
import com.unievt.repository.PartnerRepository;
import com.unievt.repository.SponsorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ApiPartnerService {

    private final PartnerRepository partnerRepository;
    private final SponsorRepository sponsorRepository;
    private final EvenementRepository evenementRepository;

    // ── Partners ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<PartnerDto> listPartners(Pageable pageable) {
        return partnerRepository.findAll(pageable).map(this::toPartnerDto);
    }

    @Transactional(readOnly = true)
    public PartnerDto getPartner(UUID id) {
        return toPartnerDto(getPartnerOrThrow(id));
    }

    public PartnerDto createPartner(CreatePartnerRequest req) {
        if (partnerRepository.existsByNom(req.getNom())) {
            throw new ConflictException("Un partenaire avec ce nom existe déjà: " + req.getNom());
        }
        Partner partner = Partner.builder()
                .nom(req.getNom())
                .description(req.getDescription())
                .logoUrl(req.getLogoUrl())
                .siteWeb(req.getSiteWeb())
                .emailContact(req.getEmailContact())
                .nomContact(req.getNomContact())
                .type(req.getType())
                .actif(true)
                .build();
        return toPartnerDto(partnerRepository.save(partner));
    }

    public PartnerDto updatePartner(UUID id, CreatePartnerRequest req) {
        Partner partner = getPartnerOrThrow(id);
        if (req.getNom() != null) partner.setNom(req.getNom());
        if (req.getDescription() != null) partner.setDescription(req.getDescription());
        if (req.getLogoUrl() != null) partner.setLogoUrl(req.getLogoUrl());
        if (req.getSiteWeb() != null) partner.setSiteWeb(req.getSiteWeb());
        if (req.getEmailContact() != null) partner.setEmailContact(req.getEmailContact());
        if (req.getNomContact() != null) partner.setNomContact(req.getNomContact());
        if (req.getType() != null) partner.setType(req.getType());
        return toPartnerDto(partnerRepository.save(partner));
    }

    public void deletePartner(UUID id) {
        getPartnerOrThrow(id);
        partnerRepository.deleteById(id);
    }

    // ── Sponsors ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<EventSponsorDto> listSponsors(Long evenementId) {
        return sponsorRepository.findByEvenementIdOrderByTier(evenementId)
                .stream().map(this::toSponsorDto).toList();
    }

    public EventSponsorDto addSponsor(Long evenementId, CreateSponsorRequest req) {
        if (sponsorRepository.existsByPartenaireIdAndEvenementId(req.getPartenaireId(), evenementId)) {
            throw new ConflictException("Ce partenaire est déjà sponsor de cet événement");
        }

        Partner partner = getPartnerOrThrow(req.getPartenaireId());
        Evenement evenement = evenementRepository.findById(evenementId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Événement introuvable: " + evenementId));

        Sponsor sponsor = Sponsor.builder()
                .partenaire(partner)
                .evenement(evenement)
                .niveau(req.getNiveau())
                .montant(req.getMontant())
                .displayOrder(req.getDisplayOrder() != null ? req.getDisplayOrder() : 0)
                .confirme(false)
                .build();

        return toSponsorDto(sponsorRepository.save(sponsor));
    }

    public void removeSponsor(Long evenementId, UUID partenaireId) {
        Sponsor sponsor = sponsorRepository.findByPartenaireIdAndEvenementId(partenaireId, evenementId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Lien de sponsoring introuvable"));
        sponsorRepository.delete(sponsor);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Partner getPartnerOrThrow(UUID id) {
        return partnerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Partenaire introuvable: " + id));
    }

    private PartnerDto toPartnerDto(Partner p) {
        return PartnerDto.builder()
                .id(p.getId())
                .nom(p.getNom())
                .description(p.getDescription())
                .logoUrl(p.getLogoUrl())
                .siteWeb(p.getSiteWeb())
                .emailContact(p.getEmailContact())
                .nomContact(p.getNomContact())
                .type(p.getType())
                .actif(p.isActif())
                .createdAt(p.getCreatedAt())
                .build();
    }

    private EventSponsorDto toSponsorDto(Sponsor s) {
        return EventSponsorDto.builder()
                .id(s.getId())
                .partenaire(s.getPartenaire() != null ? toPartnerDto(s.getPartenaire()) : null)
                .niveau(s.getNiveau())
                .montant(s.getMontant())
                .confirme(s.isConfirme())
                .displayOrder(s.getDisplayOrder())
                .build();
    }
}
