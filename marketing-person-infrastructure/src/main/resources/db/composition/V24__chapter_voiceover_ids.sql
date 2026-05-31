-- ============================================================
-- 章节多配音池：composition_chapter.voiceover_ids（CSV 多个 voiceover_asset.id）
-- 渲染每条 plan 时按 planHash 从该列表 deterministic 随机选 1 个；为空时回落到原 voiceover_id 单值。
-- DRDS 没启用 Flyway，本脚本是文档；需要在 DRDS 控制台手工执行。
-- ============================================================

ALTER TABLE composition_chapter
    ADD COLUMN voiceover_ids VARCHAR(2000) NULL
        COMMENT '章节多配音池：voiceover_asset.id CSV，渲染每条作品时随机选一'
        AFTER voiceover_id;
