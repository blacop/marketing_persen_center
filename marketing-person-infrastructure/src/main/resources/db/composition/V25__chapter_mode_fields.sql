-- ============================================================
-- 章节模式细分字段（对齐 AutoCutVideo v2.30 五种模式 UI 实测）：
--   length_adjust_mode  CROP / SPEED         — 模式 2「为配音填充画面」长度处理方式
--   audio_reuse_mode    ONCE / REUSE          — 模式 1/2/3 配音重复率
--   loop_strategy       FILL_THEN_CROP /
--                       FIXED_ROUNDS_THEN_SPEED — 模式 3「为配音循环情节」循环策略
--   loop_rounds         循环轮次              — 模式 3 策略 ②
-- DRDS 没启用 Flyway，本脚本是文档；需要在 DRDS 控制台手工执行。
-- ============================================================

ALTER TABLE composition_chapter
    ADD COLUMN length_adjust_mode VARCHAR(16) NULL
        COMMENT '模式 2 长度处理：CROP 剪切视频时长 / SPEED 改变视频速度'
        AFTER overflow_trim,
    ADD COLUMN audio_reuse_mode VARCHAR(16) NULL
        COMMENT '配音重复率（模式 1/2/3）：ONCE 每个配音只用一次 / REUSE 允许重复使用'
        AFTER length_adjust_mode,
    ADD COLUMN loop_strategy VARCHAR(32) NULL
        COMMENT '模式 3 循环策略：FILL_THEN_CROP 循环填满后剪尾 / FIXED_ROUNDS_THEN_SPEED 循环 N 轮再变速对齐'
        AFTER audio_reuse_mode,
    ADD COLUMN loop_rounds INT NULL
        COMMENT '模式 3 策略 ② 的循环轮次'
        AFTER loop_strategy;
