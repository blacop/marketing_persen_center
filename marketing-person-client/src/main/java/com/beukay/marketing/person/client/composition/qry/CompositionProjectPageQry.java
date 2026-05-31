package com.beukay.marketing.person.client.composition.qry;

import com.beukay.ai.common.entity.PageQuery;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.io.Serializable;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class CompositionProjectPageQry extends PageQuery implements Serializable {

    private static final long serialVersionUID = 1L;

    /** SUN_WUKONG / ZHU_GE_LIANG，可空 */
    private String mode;
    /** DRAFT / READY / ARCHIVED，可空 */
    private String status;
    /** 名称模糊匹配 */
    private String name;
    /** CATEGORY / FOLDER，可空 */
    private String chapterSource;
}
