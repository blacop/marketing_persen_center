package com.beukay.marketing.person.domain.composition.ability;

import com.beukay.marketing.person.client.composition.enums.OverflowTrimStrategy;
import com.beukay.marketing.person.domain.composition.model.ClipPick;
import com.beukay.marketing.person.domain.composition.model.MaterialClip;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

/**
 * 选片算法（纯函数，无 IO）。
 *
 * <p>核心规则：累计镜头时长 ≥ 目标时长，最后一条按 overflow 策略裁剪到刚好对齐。
 */
public final class ClipPicker {

    private ClipPicker() {}

    /**
     * 按目标时长贪心选片。
     *
     * @param pool          候选素材（已按 tag 过滤）
     * @param targetMs      目标时长（配音时长 / 章节最短时长）
     * @param overflow      溢出裁剪策略，默认 TRIM_TAIL
     * @param allowReuse    是否允许同一 clip 重复使用
     * @param r             随机源（保证组合可复现）
     */
    public static List<ClipPick> alignToDuration(List<MaterialClip> pool,
                                                  long targetMs,
                                                  OverflowTrimStrategy overflow,
                                                  boolean allowReuse,
                                                  Random r) {
        List<ClipPick> out = new ArrayList<>();
        if (pool == null || pool.isEmpty() || targetMs <= 0) {
            return out;
        }
        OverflowTrimStrategy trim = overflow == null ? OverflowTrimStrategy.TRIM_TAIL : overflow;
        List<MaterialClip> remaining = new ArrayList<>(pool);
        Collections.shuffle(remaining, r == null ? new Random() : r);

        long acc = 0;
        int idx = 0;
        while (acc < targetMs) {
            if (remaining.isEmpty()) {
                if (!allowReuse) break;
                remaining = new ArrayList<>(pool);
                Collections.shuffle(remaining, r == null ? new Random() : r);
            }
            MaterialClip c = remaining.get(idx % remaining.size());
            if (!allowReuse) {
                remaining.remove(idx % remaining.size());
            }
            long clipDur = nullSafe(c.getDurationMs());
            if (clipDur <= 0) {
                continue; // skip clips with unknown duration
            }
            long need = targetMs - acc;
            if (clipDur <= need) {
                out.add(fullPick(c));
                acc += clipDur;
            } else {
                out.add(trimPick(c, need, trim));
                acc = targetMs;
            }
        }
        return out;
    }

    /**
     * 模式 1「一个配音多个视频」用：选 n 段原长视频，不裁切。
     * 由调用方计算 speedFactor = sum(picks) / voDur 作为变速倍率，整体压缩/拉伸到配音时长。
     * 等价于 pickFixedCount，留独立名以表达意图。
     */
    public static List<ClipPick> pickFixedCountFullLen(List<MaterialClip> pool, int n,
                                                        boolean allowReuse, Random r) {
        return pickFixedCount(pool, n, allowReuse, r);
    }

    /** 选固定数量的素材（不需要时长对齐，画面驱动模式用） */
    public static List<ClipPick> pickFixedCount(List<MaterialClip> pool, int n,
                                                 boolean allowReuse, Random r) {
        List<ClipPick> out = new ArrayList<>();
        if (pool == null || pool.isEmpty() || n <= 0) {
            return out;
        }
        List<MaterialClip> remaining = new ArrayList<>(pool);
        Collections.shuffle(remaining, r == null ? new Random() : r);
        for (int i = 0; i < n; i++) {
            if (remaining.isEmpty()) {
                if (!allowReuse) break;
                remaining = new ArrayList<>(pool);
                Collections.shuffle(remaining, r == null ? new Random() : r);
            }
            MaterialClip c = remaining.get(0);
            remaining.remove(0);
            out.add(fullPick(c));
        }
        return out;
    }

    /** 单片循环（LOOP_CLIP_FOR_VO 用，仅返 1 个完整 clip；只在 voDur=0 时退化用） */
    public static List<ClipPick> pickOneForLoop(List<MaterialClip> pool, Random r) {
        List<ClipPick> out = new ArrayList<>(1);
        if (pool == null || pool.isEmpty()) return out;
        Random rng = r == null ? new Random() : r;
        MaterialClip c = pool.get(rng.nextInt(pool.size()));
        out.add(fullPick(c));
        return out;
    }

    /**
     * LOOP_CLIP_FOR_VO「为配音循环情节」：随机取一个 clip，重复 ceil(target/clipDur) 次，
     * 末尾按 trim 策略裁剪到刚好 = target。对应 AutoCutVideo 模式 3。
     */
    public static List<ClipPick> pickLoopToDuration(List<MaterialClip> pool, long targetMs,
                                                      OverflowTrimStrategy overflow, Random r) {
        List<ClipPick> out = new ArrayList<>();
        if (pool == null || pool.isEmpty() || targetMs <= 0) return out;
        Random rng = r == null ? new Random() : r;
        MaterialClip c = pool.get(rng.nextInt(pool.size()));
        long clipDur = nullSafe(c.getDurationMs());
        if (clipDur <= 0) return out;
        OverflowTrimStrategy trim = overflow == null ? OverflowTrimStrategy.TRIM_TAIL : overflow;
        long acc = 0;
        while (acc < targetMs) {
            long need = targetMs - acc;
            if (clipDur <= need) {
                out.add(fullPick(c));
                acc += clipDur;
            } else {
                out.add(trimPick(c, need, trim));
                acc = targetMs;
            }
        }
        return out;
    }

    /**
     * LOOP_CLIP_FOR_VO「固定循环 N 轮 + 整体变速」：随机取一个 clip，重复 N 次，全部原长。
     * 调用方计算 speedFactor = (clipDur * rounds) / voDur，配合章节级变速对齐配音。
     * 对应 AutoCutVideo 模式 3 的 FIXED_ROUNDS_THEN_SPEED 策略。
     */
    public static List<ClipPick> pickFixedRoundsLoop(List<MaterialClip> pool, int rounds, Random r) {
        List<ClipPick> out = new ArrayList<>();
        if (pool == null || pool.isEmpty() || rounds <= 0) return out;
        Random rng = r == null ? new Random() : r;
        MaterialClip c = pool.get(rng.nextInt(pool.size()));
        long clipDur = nullSafe(c.getDurationMs());
        if (clipDur <= 0) return out;
        for (int i = 0; i < rounds; i++) {
            out.add(fullPick(c));
        }
        return out;
    }

    /**
     * NO_VO_MIN_DURATION「至少 X 秒」：累计时长 ≥ minMs 即停，<b>末尾不裁</b>，超出也保留原长。
     * 对应 AutoCutVideo 模式 5（loose duration）。
     */
    public static List<ClipPick> pickMinDuration(List<MaterialClip> pool, long minMs,
                                                   boolean allowReuse, Random r) {
        List<ClipPick> out = new ArrayList<>();
        if (pool == null || pool.isEmpty() || minMs <= 0) return out;
        List<MaterialClip> remaining = new ArrayList<>(pool);
        Collections.shuffle(remaining, r == null ? new Random() : r);
        long acc = 0;
        while (acc < minMs) {
            if (remaining.isEmpty()) {
                if (!allowReuse) break;
                remaining = new ArrayList<>(pool);
                Collections.shuffle(remaining, r == null ? new Random() : r);
            }
            MaterialClip c = remaining.remove(0);
            long clipDur = nullSafe(c.getDurationMs());
            if (clipDur <= 0) continue;
            out.add(fullPick(c));
            acc += clipDur;
        }
        return out;
    }

    /**
     * ONE_VO_MULTI_CLIP「一个配音多个视频」：选 n 段画面，每段裁切到 voDur/n。
     * 最后一段用 (voDur - 已用时长) 补足余数；clip 不够长就用全长（落幕段总时长可能 &lt; voDur）。
     * 对应 AutoCutVideo 模式 1。
     */
    public static List<ClipPick> pickFixedCountAlignedToDuration(List<MaterialClip> pool, int n,
                                                                  long targetMs,
                                                                  OverflowTrimStrategy overflow,
                                                                  Random r) {
        List<ClipPick> out = new ArrayList<>();
        if (pool == null || pool.isEmpty() || n <= 0 || targetMs <= 0) return out;
        long perSegMs = targetMs / n;
        if (perSegMs <= 0) perSegMs = targetMs;
        OverflowTrimStrategy trim = overflow == null ? OverflowTrimStrategy.TRIM_TAIL : overflow;
        List<MaterialClip> remaining = new ArrayList<>(pool);
        Collections.shuffle(remaining, r == null ? new Random() : r);
        long acc = 0;
        for (int i = 0; i < n && !remaining.isEmpty(); i++) {
            MaterialClip c = remaining.remove(0);
            long clipDur = nullSafe(c.getDurationMs());
            if (clipDur <= 0) { i--; continue; }
            long want = (i == n - 1) ? (targetMs - acc) : perSegMs;
            if (want <= 0) want = perSegMs;
            if (clipDur >= want) {
                out.add(trimPick(c, want, trim));
                acc += want;
            } else {
                out.add(fullPick(c));
                acc += clipDur;
            }
        }
        return out;
    }

    private static ClipPick fullPick(MaterialClip c) {
        long dur = nullSafe(c.getDurationMs());
        return ClipPick.builder()
                .clipId(c.getId())
                .ossKey(c.getOssKey())
                .originalName(c.getOriginalName())
                .startMs(0L)
                .endMs(dur)
                .takenDurationMs(dur)
                .originalDurationMs(dur)
                .trimmed(Boolean.FALSE)
                .build();
    }

    private static ClipPick trimPick(MaterialClip c, long need, OverflowTrimStrategy strategy) {
        long total = nullSafe(c.getDurationMs());
        long start;
        long end;
        switch (strategy) {
            case TRIM_HEAD -> { start = total - need; end = total; }
            case TRIM_BOTH -> {
                long half = (total - need) / 2;
                start = half; end = half + need;
            }
            case TRIM_TAIL -> { start = 0; end = need; }
            default        -> { start = 0; end = need; }
        }
        return ClipPick.builder()
                .clipId(c.getId())
                .ossKey(c.getOssKey())
                .originalName(c.getOriginalName())
                .startMs(start)
                .endMs(end)
                .takenDurationMs(need)
                .originalDurationMs(total)
                .trimmed(Boolean.TRUE)
                .build();
    }

    private static long nullSafe(Long v) { return v == null ? 0L : v; }
}
