package com.beukay.marketing.person.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CmCollectionDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long id;
    private String collectionCode;
    private String name;
    private String skuId;
    private String mode;
    private LocalDateTime createAt;
    private String createName;
}
