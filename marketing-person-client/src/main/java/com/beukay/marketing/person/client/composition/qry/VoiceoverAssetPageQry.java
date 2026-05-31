package com.beukay.marketing.person.client.composition.qry;

import com.beukay.ai.common.entity.PageQuery;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.io.Serializable;

/** 配音分页查询 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class VoiceoverAssetPageQry extends PageQuery implements Serializable {

    private static final long serialVersionUID = 1L;

    /** UPLOAD / TTS_DOUBAO，可空 */
    private String source;

    /** 文案模糊匹配 */
    private String text;

    /** 镜头类型 MaterialCategory，可空；特殊值 "__UNCATEGORIZED__" 表示未分类 */
    private String category;
}
