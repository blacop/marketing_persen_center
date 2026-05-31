-- ============================================================
-- 文件夹绑定一个「参考音频」：用户上传素材文件夹时，每个子目录里的
-- 音频文件作为该分类的参考（指导拆解的目标时长 / 示例配音）。
-- DRDS 没启用 Flyway，本脚本是文档；需要在 DRDS 控制台手工执行。
-- ============================================================

ALTER TABLE material_folder
    ADD COLUMN ref_audio_oss_key       VARCHAR(512) NULL COMMENT '参考音频 OSS key（无 OSS 时 local://绝对路径）'
        AFTER description,
    ADD COLUMN ref_audio_duration_ms   BIGINT       NULL COMMENT '参考音频时长（毫秒）'
        AFTER ref_audio_oss_key,
    ADD COLUMN ref_audio_filename      VARCHAR(255) NULL COMMENT '参考音频原始文件名'
        AFTER ref_audio_duration_ms;
