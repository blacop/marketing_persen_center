package com.beukay.marketing.person.app.cutmatrix.linkingest.asr;

import lombok.extern.log4j.Log4j2;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.util.List;
import java.util.Random;

/**
 * Mock ASR：随机从样本池返回，配合 1-2s 延迟模拟真实接口。
 * 开发期默认启用：cm.asr.provider=mock（未配置时也走这里，作为兜底）。
 */
@Service
@Log4j2
@ConditionalOnProperty(value = "cm.asr.provider", havingValue = "mock", matchIfMissing = true)
public class MockAsrAdapter implements AsrAdapter {

    private static final String[] SAMPLES = {
            "这款产品真的太绝了！用了一周皮肤状态明显改善，毛孔细了，肤色也亮了很多。每天早晚各用一次，配合精华效果翻倍。非常推荐给熬夜党和皮肤敏感的姐妹们！",
            "实测好物分享！这个面霜成分干净，适合敏感肌，上脸不油腻，保湿力超强。尤其是秋冬换季皮肤干到爆的时候，一抹就救了！价格也很友好，强烈安利！",
            "好用到哭的一款精华！滴管设计很卫生，质地轻薄好吸收，一点都不粘。坚持用了两个月，细纹淡了，皮肤弹性变好了。这绝对是我今年回购最多的护肤品！",
            "种草了好久终于入手！外包装简约高级，开盖就是淡淡的香味，不刺激。涂抹均匀后皮肤像喝饱水一样，第二天早起皮肤还是水润的状态。真的值得买！",
    };

    private final Random rand = new Random();

    @Override
    public AsrResult transcribe(Path audioFile, AsrOptions options) throws Exception {
        log.info("[MockAsr] transcribe {} (lang={})", audioFile, options == null ? "zh" : options.getLang());
        // 模拟网络延迟（按文件大小估算，min 800ms）
        long delay = 800;
        try {
            long size = java.nio.file.Files.size(audioFile);
            delay = Math.max(800, Math.min(3500, size / 50_000));
        } catch (Exception ignore) { /* */ }
        Thread.sleep(delay);

        String text = SAMPLES[rand.nextInt(SAMPLES.length)];
        // 拆句构造段落（按 [。！？]）
        String[] sentences = text.split("(?<=[。！？])");
        List<AsrResult.Segment> segs = new java.util.ArrayList<>();
        double cursor = 0;
        for (String s : sentences) {
            if (s.isBlank()) continue;
            double dur = Math.max(1.5, s.length() * 0.25);
            segs.add(AsrResult.Segment.builder().start(cursor).end(cursor + dur).text(s.trim()).build());
            cursor += dur;
        }

        return AsrResult.builder()
                .text(text)
                .segments(segs)
                .provider("mock")
                .build();
    }
}
