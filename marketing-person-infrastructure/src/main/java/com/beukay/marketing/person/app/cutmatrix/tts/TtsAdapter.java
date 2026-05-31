package com.beukay.marketing.person.app.cutmatrix.tts;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 语音合成适配器。
 * 多模块共享：tts-batch / paragraph-align（合成配音轨）。
 *
 * 实现：
 *   - DashScopeTtsAdapter   阿里百炼 cosyvoice（OpenAI 兼容模式）
 *   - VolcTtsAdapter        字节火山引擎 TTS（待建）
 */
public interface TtsAdapter {

    /**
     * 单条文本转 mp3 字节。
     * @param text     ≤500 字
     * @param voiceId  音色标识，如 "longxiaochun" / "longwan"
     * @param speed    语速 0.5-2.0，1.0 默认
     * @return mp3 字节
     */
    byte[] synth(String text, String voiceId, double speed) throws Exception;

    /** 可用音色列表 */
    List<Voice> listVoices();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    class Voice {
        /** 唯一 ID（如 longxiaochun） */
        private String id;
        /** 中文名（如 龙小淳） */
        private String name;
        /** 性别 male / female */
        private String gender;
        /** 风格描述 */
        private String style;
        /** 语言 zh-cn / en / ja / multi */
        private String lang;
        /** 是否星标推荐 */
        private boolean starred;
    }
}
