package com.beukay.marketing.person.client.qry;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContentStructureCardDetailQry implements Serializable {

    private static final long serialVersionUID = 1L;

    private String cardId;
    private Long id;
}
