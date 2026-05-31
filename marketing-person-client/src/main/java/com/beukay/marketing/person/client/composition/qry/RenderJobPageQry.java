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
public class RenderJobPageQry extends PageQuery implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long projectId;
    /** RenderStatus 枚举名 */
    private String status;
}
