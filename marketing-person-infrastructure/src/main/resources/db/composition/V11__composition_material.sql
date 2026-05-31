-- ============================================================
-- 视频合成工作流：素材库 + 标签 + N:M 关联
-- 八字段规范：id / nezha_tenant_code / is_deleted / create_at / create_by /
--             create_name / update_at / update_by / update_name
-- ============================================================

CREATE TABLE IF NOT EXISTS material_clip (
    id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    oss_key           VARCHAR(512) NOT NULL COMMENT 'OSS 对象 key',
    kind              VARCHAR(16)  NOT NULL COMMENT 'VIDEO / IMAGE',
    original_name     VARCHAR(255) NOT NULL COMMENT '原始文件名',
    duration_ms       BIGINT       COMMENT '时长（毫秒）',
    width             INT          COMMENT '宽',
    height            INT          COMMENT '高',
    fps               DOUBLE       COMMENT '帧率',
    bitrate           BIGINT       COMMENT '码率（bps）',
    file_size         BIGINT       COMMENT '文件大小（字节）',
    sha256            CHAR(64)     COMMENT '文件内容 sha256，自然去重',
    source_type       VARCHAR(32)  NOT NULL DEFAULT 'MANUAL_UPLOAD' COMMENT 'MANUAL_UPLOAD / DECONSTRUCTION_AGENT',
    source_extra      JSON         COMMENT '来源附加信息（拆解 agent 写入原视频 URL/runId 等）',
    tags_cache        JSON         COMMENT '标签缓存 [{id,name,category}]，规避段落对齐 JOIN',
    nezha_tenant_code VARCHAR(64)  NOT NULL DEFAULT 'default',
    is_deleted        TINYINT      NOT NULL DEFAULT 0,
    create_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    create_by         BIGINT       NOT NULL DEFAULT 0,
    create_name       VARCHAR(64)  NOT NULL DEFAULT 'system',
    update_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    update_by         BIGINT       NOT NULL DEFAULT 0,
    update_name       VARCHAR(64)  NOT NULL DEFAULT 'system',
    UNIQUE KEY uk_sha256_tenant (sha256, nezha_tenant_code, is_deleted),
    KEY idx_kind_duration (kind, duration_ms, is_deleted),
    KEY idx_source_type (source_type, is_deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='合成-素材片段';


CREATE TABLE IF NOT EXISTS material_tag (
    id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name              VARCHAR(64)  NOT NULL COMMENT '标签名',
    category          VARCHAR(32)  NOT NULL COMMENT '类别：动机/手法/场景/其他',
    color             VARCHAR(16)  COMMENT 'UI 颜色，如 #FF0000',
    description       VARCHAR(255) COMMENT '描述',
    nezha_tenant_code VARCHAR(64)  NOT NULL DEFAULT 'default',
    is_deleted        TINYINT      NOT NULL DEFAULT 0,
    create_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    create_by         BIGINT       NOT NULL DEFAULT 0,
    create_name       VARCHAR(64)  NOT NULL DEFAULT 'system',
    update_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    update_by         BIGINT       NOT NULL DEFAULT 0,
    update_name       VARCHAR(64)  NOT NULL DEFAULT 'system',
    UNIQUE KEY uk_name_category_tenant (name, category, nezha_tenant_code, is_deleted),
    KEY idx_category (category, is_deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='合成-素材标签';


CREATE TABLE IF NOT EXISTS material_clip_tag (
    id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    clip_id           BIGINT       NOT NULL COMMENT 'material_clip.id',
    tag_id            BIGINT       NOT NULL COMMENT 'material_tag.id',
    nezha_tenant_code VARCHAR(64)  NOT NULL DEFAULT 'default',
    is_deleted        TINYINT      NOT NULL DEFAULT 0,
    create_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    create_by         BIGINT       NOT NULL DEFAULT 0,
    create_name       VARCHAR(64)  NOT NULL DEFAULT 'system',
    update_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    update_by         BIGINT       NOT NULL DEFAULT 0,
    update_name       VARCHAR(64)  NOT NULL DEFAULT 'system',
    UNIQUE KEY uk_clip_tag (clip_id, tag_id, is_deleted),
    KEY idx_tag (tag_id, is_deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='合成-素材标签关联';
