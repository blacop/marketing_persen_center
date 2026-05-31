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
public class SourceVideoPageQry extends PageQuery implements Serializable {

    private static final long serialVersionUID = 1L;

    /** DRAFT / EXPORTED，可空 */
    private String status;

    /** 文件名模糊匹配，可空 */
    private String name;
}
