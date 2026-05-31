-- ============================================================
-- 视频合成工作流：合成项目 + 章节
-- ============================================================

CREATE TABLE IF NOT EXISTS composition_project (
    id                          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name                        VARCHAR(128) NOT NULL COMMENT '项目名',
    description                 VARCHAR(512) COMMENT '描述',
    mode                        VARCHAR(16)  NOT NULL COMMENT 'SUN_WUKONG / ZHU_GE_LIANG',
    combination_strategy        VARCHAR(16)  NOT NULL DEFAULT 'ROOKIE' COMMENT 'ROOKIE / MATRIX',
    target_count                INT          NOT NULL DEFAULT 10 COMMENT '目标产出条数（≤1000）',
    global_bgm_voiceover_id     BIGINT       COMMENT '全局 BGM/配音 voiceover_asset.id',
    output_width                INT          NOT NULL DEFAULT 1080,
    output_height               INT          NOT NULL DEFAULT 1920,
    output_fps                  INT          NOT NULL DEFAULT 30,
    status                      VARCHAR(16)  NOT NULL DEFAULT 'DRAFT' COMMENT 'DRAFT / READY / ARCHIVED',
    extra                       JSON         COMMENT '扩展字段',
    nezha_tenant_code           VARCHAR(64)  NOT NULL DEFAULT 'default',
    is_deleted                  TINYINT      NOT NULL DEFAULT 0,
    create_at                   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    create_by                   BIGINT       NOT NULL DEFAULT 0,
    create_name                 VARCHAR(64)  NOT NULL DEFAULT 'system',
    update_at                   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    update_by                   BIGINT       NOT NULL DEFAULT 0,
    update_name                 VARCHAR(64)  NOT NULL DEFAULT 'system',
    KEY idx_status (status, is_deleted),
    KEY idx_mode (mode, is_deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='合成-项目';


CREATE TABLE IF NOT EXISTS composition_chapter (
    id                          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id                  BIGINT       NOT NULL COMMENT 'composition_project.id',
    sort_no                     INT          NOT NULL DEFAULT 0 COMMENT '章节顺序',
    name                        VARCHAR(128) COMMENT '章节名',
    audio_mode                  VARCHAR(32)  NOT NULL COMMENT 'ONE_VO_MULTI_CLIP/FILL_CLIPS_FOR_VO/LOOP_CLIP_FOR_VO/NO_VO_FIXED_COUNT/NO_VO_MIN_DURATION',
    voiceover_id                BIGINT       COMMENT 'voiceover_asset.id',
    fixed_clip_count            INT          COMMENT '固定素材数（NO_VO_FIXED_COUNT / ONE_VO_MULTI_CLIP 用）',
    min_duration_ms             BIGINT       COMMENT '最短时长（NO_VO_MIN_DURATION 用）',
    allow_voiceover_reuse       TINYINT      NOT NULL DEFAULT 0 COMMENT '是否允许配音复用',
    strip_original_audio        TINYINT      NOT NULL DEFAULT 1 COMMENT '是否去除素材原音',
    overflow_trim               VARCHAR(16)  NOT NULL DEFAULT 'TRIM_TAIL' COMMENT 'TRIM_HEAD/TRIM_TAIL/TRIM_BOTH',
    repeat_rate                 DOUBLE       NOT NULL DEFAULT 0.0 COMMENT '0=最严不复用~1=完全允许',
    tag_filter                  JSON         COMMENT '选片 tag 过滤器 [{tagId,name}]',
    extra                       JSON         COMMENT '扩展字段',
    nezha_tenant_code           VARCHAR(64)  NOT NULL DEFAULT 'default',
    is_deleted                  TINYINT      NOT NULL DEFAULT 0,
    create_at                   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    create_by                   BIGINT       NOT NULL DEFAULT 0,
    create_name                 VARCHAR(64)  NOT NULL DEFAULT 'system',
    update_at                   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    update_by                   BIGINT       NOT NULL DEFAULT 0,
    update_name                 VARCHAR(64)  NOT NULL DEFAULT 'system',
    KEY idx_project_sort (project_id, sort_no, is_deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='合成-章节';
