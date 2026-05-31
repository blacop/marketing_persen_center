-- ============================================================
-- 视频拆解：源视频（待拆分的长视频）+ 片段标记 (segments_json)
-- 工作流：导入长视频 → 用户在前端时间线打 IN/OUT 点 → 选 category →
--         调 POST /split 接口按片段切出 mp4 入 material_clip
-- DRDS 没启用 Flyway，本脚本是文档；需要在 DRDS 控制台手工执行。
-- ============================================================

CREATE TABLE IF NOT EXISTS source_video (
    id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    oss_key           VARCHAR(512) NOT NULL COMMENT '源视频 OSS key（无 OSS 时 local://绝对路径）',
    original_name     VARCHAR(255) COMMENT '原始文件名',
    duration_ms       BIGINT       COMMENT '总时长（毫秒）',
    file_size         BIGINT       COMMENT '文件大小（字节）',
    width             INT          COMMENT '宽',
    height            INT          COMMENT '高',
    segments_json     TEXT         COMMENT '片段列表 JSON：[{startMs,endMs,category,name?,memo?}]',
    status            VARCHAR(32)  NOT NULL DEFAULT 'DRAFT' COMMENT 'DRAFT / EXPORTED',
    nezha_tenant_code VARCHAR(64)  NOT NULL DEFAULT 'default',
    is_deleted        TINYINT      NOT NULL DEFAULT 0,
    create_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    create_by         BIGINT       NOT NULL DEFAULT 0,
    create_name       VARCHAR(64)  NOT NULL DEFAULT 'system',
    update_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    update_by         BIGINT       NOT NULL DEFAULT 0,
    update_name       VARCHAR(64)  NOT NULL DEFAULT 'system',
    KEY idx_status (status, is_deleted),
    KEY idx_create_at (create_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='视频拆解-源视频';
