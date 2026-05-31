-- ============================================================
-- 诸葛亮 FOLDER 模式新增「BGM 库」和章节「转场」开关：
--   composition_project.bgm_voiceover_ids   FOLDER 模式 bgm/ 子目录上传的 voiceover_asset.id 列表（CSV）
--   composition_project.bgm_loop_mode       BGM 比视频短时的策略：LOOP=循环 / PICK_AGAIN=再随机抽
--   composition_project.bgm_volume          BGM 音量 0-100
--   composition_project.bgm_start_chapter   从第几章开始应用 BGM（1-based）
--   composition_chapter.transition_enabled  是否在素材之间加转场（前端开关，后端渲染暂不消费）
-- DRDS 没启用 Flyway，本脚本是文档；需要在 DRDS 控制台手工执行。
-- ============================================================

ALTER TABLE composition_project
    ADD COLUMN bgm_voiceover_ids   VARCHAR(2000) NULL
        COMMENT 'BGM 库：voiceover_asset.id CSV（FOLDER 模式 bgm/ 子目录上传）'
        AFTER global_bgm_voiceover_id,
    ADD COLUMN bgm_loop_mode       VARCHAR(16) NOT NULL DEFAULT 'LOOP'
        COMMENT 'LOOP=BGM 循环；PICK_AGAIN=再随机抽一首'
        AFTER bgm_voiceover_ids,
    ADD COLUMN bgm_volume          INT NOT NULL DEFAULT 70
        COMMENT 'BGM 音量 0-100'
        AFTER bgm_loop_mode,
    ADD COLUMN bgm_start_chapter   INT NOT NULL DEFAULT 1
        COMMENT '从第几章开始应用 BGM（1-based）'
        AFTER bgm_volume;

ALTER TABLE composition_chapter
    ADD COLUMN transition_enabled  TINYINT NOT NULL DEFAULT 0
        COMMENT '是否在素材之间添加转场（前端开关，后端渲染暂不消费）'
        AFTER source_folder_name;
