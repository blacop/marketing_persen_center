package com.beukay.marketing.person.client.composition.cmd;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

/** 修改素材标签关联（全量替换） */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMaterialClipTagsCmd implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotNull
    private List<Long> tagIds;
}
