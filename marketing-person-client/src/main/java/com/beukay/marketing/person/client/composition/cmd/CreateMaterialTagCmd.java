package com.beukay.marketing.person.client.composition.cmd;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * 创建素材标签命令。同 name+category 已存在时返回原 ID（幂等）。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateMaterialTagCmd implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotBlank
    private String name;

    @NotBlank
    private String category;

    private String color;

    private String description;
}
