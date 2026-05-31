-- 配音也按 MaterialCategory 同一套镜头类型分类（共用枚举）
-- DRDS 没启用 Flyway，本脚本是文档；需要在 DRDS 控制台手工执行。

ALTER TABLE voiceover_asset
    ADD COLUMN category VARCHAR(32) NULL COMMENT '镜头类型枚举 MaterialCategory（与素材共用）'
        AFTER format;

CREATE INDEX idx_category ON voiceover_asset(category);
