-- 视频矩阵 (Cutmatrix) P0 三张核心表 + 段落对齐编排任务表
-- 与现有 video_segment / video_assembly_task 完全隔离，前缀 cm_

CREATE TABLE IF NOT EXISTS cm_collection
(
    id                BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nezha_tenant_code VARCHAR(64)  NULL,
    is_deleted        TINYINT(1)   NOT NULL DEFAULT 0,
    collection_code   VARCHAR(64)  NOT NULL COMMENT '品名编码',
    name              VARCHAR(256) NOT NULL COMMENT '品名',
    sku_id            VARCHAR(128) NULL COMMENT '关联SKU',
    mode              VARCHAR(32)  NOT NULL DEFAULT 'PARAGRAPH_ALIGN' COMMENT '编排模式 PARAGRAPH_ALIGN/ZHUGE/SUNWUKONG',
    create_at         DATETIME     NULL,
    create_by         BIGINT       NULL,
    create_name       VARCHAR(255) NULL,
    update_at         DATETIME     NULL,
    update_by         BIGINT       NULL,
    update_name       VARCHAR(255) NULL,
    UNIQUE INDEX uk_collection_code (collection_code),
    INDEX idx_sku (sku_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'Cutmatrix 品名/一级目录';


CREATE TABLE IF NOT EXISTS cm_chapter
(
    id                BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nezha_tenant_code VARCHAR(64)  NULL,
    is_deleted        TINYINT(1)   NOT NULL DEFAULT 0,
    chapter_code      VARCHAR(64)  NOT NULL COMMENT '章节编码',
    collection_code   VARCHAR(64)  NOT NULL COMMENT '所属品名编码',
    name              VARCHAR(256) NOT NULL COMMENT '章节名',
    stage_code        VARCHAR(64)  NULL COMMENT '段落标签 HOOK/SCENE/BENEFIT/PROOF_CTA/UNTAGGED',
    order_no          INT          NOT NULL DEFAULT 0,
    voice_clip_url    VARCHAR(512) NULL COMMENT '配音URL',
    create_at         DATETIME     NULL,
    create_by         BIGINT       NULL,
    create_name       VARCHAR(255) NULL,
    update_at         DATETIME     NULL,
    update_by         BIGINT       NULL,
    update_name       VARCHAR(255) NULL,
    UNIQUE INDEX uk_chapter_code (chapter_code),
    INDEX idx_collection (collection_code),
    INDEX idx_stage (stage_code)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'Cutmatrix 章节/二级目录';


CREATE TABLE IF NOT EXISTS cm_video_segment
(
    id                  BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nezha_tenant_code   VARCHAR(64)  NULL,
    is_deleted          TINYINT(1)   NOT NULL DEFAULT 0,
    segment_code        VARCHAR(64)  NOT NULL COMMENT '片段编码',
    collection_code     VARCHAR(64)  NOT NULL COMMENT '所属品名',
    chapter_code        VARCHAR(64)  NOT NULL COMMENT '所属章节',
    video_url           VARCHAR(512) NOT NULL COMMENT '源视频URL',
    start_sec           DECIMAL(10,3) NOT NULL,
    end_sec             DECIMAL(10,3) NOT NULL,
    duration_sec        DECIMAL(10,3) NOT NULL,
    width               INT          NULL,
    height              INT          NULL,
    fps                 DECIMAL(6,3) NULL,
    no_mirror           TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '是否禁止镜像',
    order_no            INT          NOT NULL DEFAULT 0,
    -- 标签
    stage_code          VARCHAR(64)  NULL,
    scene_tags          JSON         NULL,
    selling_point_tags  JSON         NULL,
    hook_type           VARCHAR(64)  NULL,
    caption             VARCHAR(256) NULL,
    -- 来源溯源（与现有 video_deconstruction 体系隔离但保留追踪）
    source_type         VARCHAR(32)  NOT NULL DEFAULT 'UPLOAD' COMMENT 'UPLOAD/DECONSTRUCTION/ZIP/FEISHU',
    source_segment_id   VARCHAR(64)  NULL,
    source_video_id     VARCHAR(128) NULL,
    create_at           DATETIME     NULL,
    create_by           BIGINT       NULL,
    create_name         VARCHAR(255) NULL,
    update_at           DATETIME     NULL,
    update_by           BIGINT       NULL,
    update_name         VARCHAR(255) NULL,
    UNIQUE INDEX uk_segment_code (segment_code),
    INDEX idx_collection (collection_code),
    INDEX idx_chapter (chapter_code),
    INDEX idx_source (source_type, source_segment_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'Cutmatrix 视频片段';


CREATE TABLE IF NOT EXISTS cm_compose_task
(
    id                  BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nezha_tenant_code   VARCHAR(64)  NULL,
    is_deleted          TINYINT(1)   NOT NULL DEFAULT 0,
    task_code           VARCHAR(64)  NOT NULL COMMENT '编排任务编码',
    collection_code     VARCHAR(64)  NOT NULL,
    mode                VARCHAR(32)  NOT NULL COMMENT 'PARAGRAPH_ALIGN/ZHUGE/SUNWUKONG',
    sku_id              VARCHAR(128) NULL,
    narration_url       VARCHAR(512) NULL,
    sections_json       JSON         NULL COMMENT '段落配置 [{sectionNo,stageCode,narrationDurationSec,requiredTags}]',
    plan_json           JSON         NULL COMMENT '编排结果 [{sectionNo,clips:[{segmentCode,videoUrl,startSec,endSec}]}]',
    total_duration_sec  DECIMAL(10,3) NULL,
    result_video_url    VARCHAR(512) NULL,
    status              VARCHAR(32)  NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING/READY/RENDERING/SUCCEEDED/FAILED',
    error_msg           VARCHAR(1024) NULL,
    create_at           DATETIME     NULL,
    create_by           BIGINT       NULL,
    create_name         VARCHAR(255) NULL,
    update_at           DATETIME     NULL,
    update_by           BIGINT       NULL,
    update_name         VARCHAR(255) NULL,
    UNIQUE INDEX uk_task_code (task_code),
    INDEX idx_collection (collection_code),
    INDEX idx_status (status)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'Cutmatrix 编排任务';
