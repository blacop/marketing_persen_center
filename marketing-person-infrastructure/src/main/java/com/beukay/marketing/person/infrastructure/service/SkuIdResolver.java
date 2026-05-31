package com.beukay.marketing.person.infrastructure.service;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;

@Component
public class SkuIdResolver {

    private static final String SEED_CUSHION_2 = "SEED_CUSHION_2";

    private final Map<String, String> aliasToCanonical = new LinkedHashMap<>();
    private final Map<String, Set<String>> canonicalToAliases = new LinkedHashMap<>();

    public SkuIdResolver() {
        register(SEED_CUSHION_2,
                "SEED_CUSHION_2",
                "seed_cushion_2",
                "seed-cushion-2",
                "Seed Cushion 2",
                "种籽气垫2.0",
                "种籽气垫",
                "玛丽黛佳种籽气垫2.0");
    }

    public String resolve(String rawSkuId) {
        if (!StringUtils.hasText(rawSkuId)) {
            return rawSkuId;
        }
        for (String candidate : buildCandidates(rawSkuId)) {
            String canonical = aliasToCanonical.get(candidate);
            if (canonical != null) {
                return canonical;
            }
        }
        return rawSkuId.trim();
    }

    public String buildNotFoundMessage(String rawSkuId, String resolvedSkuId) {
        if (StringUtils.hasText(resolvedSkuId) && !resolvedSkuId.equals(rawSkuId)) {
            return "未找到对应SKU数据，原始入参=" + rawSkuId + "，已标准化为=" + resolvedSkuId
                    + "。当前支持别名：" + String.join(" / ", aliasesOf(resolvedSkuId));
        }
        return "未找到对应SKU数据：" + rawSkuId + "。当前支持别名：" + String.join(" / ", knownAliases());
    }

    public Set<String> aliasesOf(String canonicalSkuId) {
        return canonicalToAliases.getOrDefault(canonicalSkuId, Set.of(canonicalSkuId));
    }

    public Set<String> knownAliases() {
        LinkedHashSet<String> aliases = new LinkedHashSet<>();
        canonicalToAliases.values().forEach(aliases::addAll);
        return aliases;
    }

    private void register(String canonicalSkuId, String... aliases) {
        LinkedHashSet<String> normalizedAliases = new LinkedHashSet<>();
        for (String alias : aliases) {
            for (String candidate : buildCandidates(alias)) {
                aliasToCanonical.put(candidate, canonicalSkuId);
            }
            normalizedAliases.add(alias);
        }
        canonicalToAliases.put(canonicalSkuId, normalizedAliases);
    }

    private Set<String> buildCandidates(String rawSkuId) {
        LinkedHashSet<String> candidates = new LinkedHashSet<>();
        String trimmed = rawSkuId.trim();
        if (!StringUtils.hasText(trimmed)) {
            return candidates;
        }
        candidates.add(trimmed);
        candidates.add(trimmed.toUpperCase());
        candidates.add(trimmed.toLowerCase());

        String symbolNormalized = trimmed.replace('-', '_').replace(' ', '_');
        candidates.add(symbolNormalized);
        candidates.add(symbolNormalized.toUpperCase());
        candidates.add(symbolNormalized.toLowerCase());

        String compact = trimmed.replace(" ", "");
        candidates.add(compact);
        candidates.add(compact.toUpperCase());
        candidates.add(compact.toLowerCase());
        return candidates;
    }
}
