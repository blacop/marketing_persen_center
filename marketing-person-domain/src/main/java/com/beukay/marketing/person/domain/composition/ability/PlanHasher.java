package com.beukay.marketing.person.domain.composition.ability;

import com.beukay.marketing.person.domain.composition.model.ChapterPlan;
import com.beukay.marketing.person.domain.composition.model.ClipPick;
import com.beukay.marketing.person.domain.composition.model.CompositionPlan;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;

/** 计划签名 + SHA-256 (去重核心) */
public final class PlanHasher {

    private PlanHasher() {}

    /**
     * 把组合方案折叠为可比较 + 可复现的 signature 字符串。
     * 形式：{chapterId}:{clipId-startMs-endMs}|{chapterId}:{clipId}|...
     */
    public static String signature(CompositionPlan plan) {
        if (plan == null || plan.getChapters() == null) return "";
        List<String> chapterParts = new ArrayList<>();
        for (ChapterPlan ch : plan.getChapters()) {
            List<String> picks = new ArrayList<>();
            if (ch.getPicks() != null) {
                for (ClipPick p : ch.getPicks()) {
                    picks.add(p.getClipId() + "-" + p.getStartMs() + "-" + p.getEndMs());
                }
            }
            chapterParts.add(ch.getChapterId() + ":" + String.join(",", picks));
        }
        return String.join("|", chapterParts);
    }

    public static String sha256(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] bytes = md.digest(input.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(64);
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            // SHA-256 是 JDK 标准算法，理论上不会到这里
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
