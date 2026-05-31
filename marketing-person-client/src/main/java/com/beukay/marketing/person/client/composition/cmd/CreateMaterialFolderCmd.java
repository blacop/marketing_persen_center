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
public class CreateMaterialFolderCmd implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 稳定标识；为空时后端用 UUID 生成 */
    private String code;

    @NotBlank
    private String name;

    private Integer sortNo;
    private String color;
    private String description;
}
