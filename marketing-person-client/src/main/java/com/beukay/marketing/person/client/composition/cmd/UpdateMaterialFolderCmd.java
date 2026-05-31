package com.beukay.marketing.person.client.composition.cmd;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMaterialFolderCmd implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotBlank
    private String name;

    private Integer sortNo;
    private String color;
    private String description;
}
