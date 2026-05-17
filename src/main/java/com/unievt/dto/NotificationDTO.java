package com.unievt.dto;

import com.unievt.enums.TypeNotifEnum;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {

    private String titre;
    private String message;
    private TypeNotifEnum type;
    private Long destinataireId;
    private Long evenementId;
}
