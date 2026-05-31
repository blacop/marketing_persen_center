package com.beukay.marketing.person.dbsdk.model;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("cm_chapter")
public class CmChapterDO implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long id;
    private String chapterCode;
    private String collectionCode;
    private String name;
    private String stageCode;
    private Integer orderNo;
    private String voiceClipUrl;
    private String nezhaTenantCode;
    private LocalDateTime createAt;
    private Long createBy;
    private String createName;
    private LocalDateTime updateAt;
    private Long updateBy;
    private String updateName;
    private Integer isDeleted;
}
