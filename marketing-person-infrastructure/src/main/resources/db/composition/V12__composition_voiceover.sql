-- ============================================================
-- 视频合成工作流：配音库
-- ============================================================

CREATE TABLE IF NOT EXISTS voiceover_asset (
    id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    oss_key           VARCHAR(512) NOT NULL COMMENT 'OSS 对象 key',
    source            VARCHAR(32)  NOT NULL DEFAULT 'UPLOAD' COMMENT 'UPLOAD / TTS_DOUBAO',
    text_content      TEXT         COMMENT '配音对应文案',
    voice_code        VARCHAR(64)  COMMENT '音色编码（TTS 时使用）',
    speed             DOUBLE       COMMENT '语速倍率',
    duration_ms       BIGINT       COMMENT '时长（毫秒）',
    file_size         BIGINT       COMMENT '文件大小（字节）',
    format            VARCHAR(16)  COMMENT 'mp3 / wav / m4a',
    nezha_tenant_code VARCHAR(64)  NOT NULL DEFAULT 'default',
    is_deleted        TINYINT      NOT NULL DEFAULT 0,
    create_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    create_by         BIGINT       NOT NULL DEFAULT 0,
    create_name       VARCHAR(64)  NOT NULL DEFAULT 'system',
    update_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    update_by         BIGINT       NOT NULL DEFAULT 0,
    update_name       VARCHAR(64)  NOT NULL DEFAULT 'system',
    KEY idx_source (source, is_deleted),
    KEY idx_create_at (create_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='合成-配音资源';
