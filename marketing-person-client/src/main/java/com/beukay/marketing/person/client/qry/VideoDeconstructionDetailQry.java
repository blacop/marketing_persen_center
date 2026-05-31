package com.beukay.marketing.person.client.qry;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoDeconstructionDetailQry implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotNull
    private Long id;
}
