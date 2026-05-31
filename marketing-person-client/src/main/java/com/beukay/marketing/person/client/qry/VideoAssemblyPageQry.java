package com.beukay.marketing.person.client.qry;

import com.beukay.ai.common.entity.PageQuery;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * 视频装配任务分页查询
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoAssemblyPageQry implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 任务状态筛选（可选） */
    private String status;

    /** 脚本蓝图编号筛选（可选） */
    private String blueprintCode;

    @Valid
    private PageQuery pageQuery;
}
