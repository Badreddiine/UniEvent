package com.unievt.event;

import org.springframework.context.ApplicationEvent;

public class WaitlistPromotionEvent extends ApplicationEvent {

    private final Long evenementId;

    public WaitlistPromotionEvent(Object source, Long evenementId) {
        super(source);
        this.evenementId = evenementId;
    }

    public Long getEvenementId() {
        return evenementId;
    }
}
