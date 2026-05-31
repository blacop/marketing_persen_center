package com.beukay.marketing.person.app.composition.executor;

import com.beukay.marketing.person.client.composition.cmd.CreateMaterialFolderCmd;
import com.beukay.marketing.person.client.composition.cmd.UpdateMaterialFolderCmd;
import com.beukay.marketing.person.client.composition.dto.MaterialFolderDTO;
import com.beukay.marketing.person.domain.composition.ability.MaterialFolderService;
import com.beukay.marketing.person.domain.composition.gateway.MaterialFolderGateway;
import com.beukay.marketing.person.domain.composition.model.MaterialFolder;
import com.beukay.marketing.person.infrastructure.composition.render.CompositionRenderProperties;
import com.beukay.marketing.person.infrastructure.composition.render.FfmpegRunner;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.beukay.ai.common.exception.GenericBusinessException;
@Component
@RequiredArgsConstructor
@Log4j2
public class MaterialFolderCmdExecutor {

    private static final Pattern SORT_PREFIX = Pattern.compile("^(\\d+)[\\-_\\s\\.]?(.*)$");
    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("yyyyMM");
    private static final String[] DEFAULT_PALETTE = { "#fbbf24", "#a78bfa", "#f59e0b", "#fb7185",
            "#34d399", "#60a5fa", "#f472b6", "#22d3ee", "#84cc16", "#fb923c", "#c084fc", "#10b981", "#3b82f6" };

    private final MaterialFolderService service;
    private final MaterialFolderGateway gateway;
    private final CompositionRenderProperties renderProps;
    private final FfmpegRunner ffmpegRunner;

    public MaterialFolderDTO create(CreateMaterialFolderCmd cmd) {
        MaterialFolder f = MaterialFolder.builder()
                .code(cmd.getCode())
                .name(cmd.getName())
                .sortNo(cmd.getSortNo())
                .color(cmd.getColor())
                .description(cmd.getDescription())
                .build();
        return toDTO(service.create(f));
    }

    public MaterialFolderDTO update(Long id, UpdateMaterialFolderCmd cmd) {
        MaterialFolder cur = gateway.findById(id);
        if (cur == null) {
            throw new GenericBusinessException("folder not found: " + id);
        }
        cur.setName(cmd.getName());
        if (cmd.getSortNo() != null) cur.setSortNo(cmd.getSortNo());
        if (cmd.getColor() != null) cur.setColor(cmd.getColor());
        if (cmd.getDescription() != null) cur.setDescription(cmd.getDescription());
        return toDTO(service.update(cur));
    }

    public void delete(Long id) {
        service.delete(id);
    }

    /**
     * 批量导入：按 paths 的子目录分组，每个子目录建一个 folder；
     * 子目录里的第一个音频文件作为该 folder 的参考音频（落本地 + 探时长）。
     *
     * paths[i] 形如 "1产品描述/1-产品描述-版本2.wav"，前缀数字 → sort_no，剩余 → name。
     */
    public List<MaterialFolderDTO> importFromFolder(MultipartFile[] files, String[] paths,
                                                     String[] extraSubDirs) throws IOException {
        // files / paths 可空（纯空目录场景）；extraSubDirs 用于显式指定空子目录
        files = files == null ? new MultipartFile[0] : files;
        paths = paths == null ? new String[0] : paths;
        if (paths.length != files.length) {
            throw new GenericBusinessException("paths size must equal files size");
        }
        // 按子目录分组：subDir → list of (file, fileName)
        Map<String, List<Integer>> grouped = new LinkedHashMap<>();
        for (int i = 0; i < files.length; i++) {
            String p = paths[i] == null ? "" : paths[i].trim();
            int slash = p.indexOf('/');
            if (slash < 0) {
                log.warn("[folder.import] skip top-level file: {}", p);
                continue;
            }
            String subDir = p.substring(0, slash);
            if (subDir.isBlank() || subDir.startsWith(".")) continue;
            grouped.computeIfAbsent(subDir, k -> new ArrayList<>()).add(i);
        }
        // 把额外的（空）子目录补进来，保证它们也被建为 folder
        if (extraSubDirs != null) {
            for (String d : extraSubDirs) {
                if (d == null) continue;
                String name = d.trim();
                if (name.isBlank() || name.startsWith(".")) continue;
                grouped.computeIfAbsent(name, k -> new ArrayList<>());
            }
        }
        if (grouped.isEmpty()) {
            log.warn("[folder.import] no subdirectories detected in upload");
            return List.of();
        }

        Path dir = Paths.get(renderProps.getWorkspaceDir(), "voiceover", LocalDate.now().format(MONTH_FMT));
        Files.createDirectories(dir);

        List<MaterialFolderDTO> result = new ArrayList<>();
        int colorIdx = 0;
        for (Map.Entry<String, List<Integer>> e : grouped.entrySet()) {
            String subDir = e.getKey();
            // 解析数字前缀
            Integer sortNo = null;
            String displayName = subDir;
            Matcher m = SORT_PREFIX.matcher(subDir);
            if (m.matches()) {
                try { sortNo = Integer.parseInt(m.group(1)); } catch (NumberFormatException ignored) {}
                String rest = m.group(2);
                if (rest != null && !rest.isBlank()) displayName = rest.trim();
            }
            // code 用去掉数字前缀的纯文字，避免 LLM 误把数字当 code
            String code = (displayName == null || displayName.isBlank()) ? subDir : displayName;
            // 找该子目录里第一个音频文件作为参考
            String refOssKey = null, refFilename = null;
            Long refDurationMs = null;
            for (Integer idx : e.getValue()) {
                MultipartFile f = files[idx];
                String fname = paths[idx];
                int slash = fname.lastIndexOf('/');
                String pure = slash >= 0 ? fname.substring(slash + 1) : fname;
                if (!isAudio(pure)) continue;
                String ext = pickExtension(pure, ".mp3");
                Path target = dir.resolve(UUID.randomUUID().toString().replace("-", "") + ext);
                try (InputStream in = f.getInputStream()) {
                    Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
                }
                refDurationMs = probeDurationMs(target);
                refOssKey = "local://" + target.toAbsolutePath();
                refFilename = pure;
                break; // 只取第一个
            }

            // upsert：code 已存在则更新元信息 + ref_audio
            MaterialFolder exist = gateway.findByCode(code);
            MaterialFolder folder;
            if (exist != null) {
                exist.setName(displayName);
                if (sortNo != null) exist.setSortNo(sortNo);
                if (exist.getColor() == null || exist.getColor().isBlank()) {
                    exist.setColor(DEFAULT_PALETTE[colorIdx % DEFAULT_PALETTE.length]);
                }
                if (refOssKey != null) {
                    exist.setRefAudioOssKey(refOssKey);
                    exist.setRefAudioDurationMs(refDurationMs);
                    exist.setRefAudioFilename(refFilename);
                }
                folder = service.update(exist);
            } else {
                folder = service.create(MaterialFolder.builder()
                        .code(code).name(displayName).sortNo(sortNo)
                        .color(DEFAULT_PALETTE[colorIdx % DEFAULT_PALETTE.length])
                        .refAudioOssKey(refOssKey)
                        .refAudioDurationMs(refDurationMs)
                        .refAudioFilename(refFilename)
                        .build());
            }
            result.add(toDTO(folder));
            colorIdx++;
            log.info("[folder.import] subDir={} -> folder.id={} name={} ref={}", subDir, folder.getId(), folder.getName(), refFilename);
        }
        return result;
    }

    private Long probeDurationMs(Path file) {
        try {
            String dur = ffmpegRunner.probe(List.of(
                    "-v", "error", "-show_entries", "format=duration",
                    "-of", "default=nw=1:nk=1", file.toString()
            ), file.getParent()).trim();
            return (long) (Double.parseDouble(dur) * 1000);
        } catch (Exception e) {
            log.warn("[folder.import] ffprobe failed for {}: {}", file, e.getMessage());
            return null;
        }
    }

    private static boolean isAudio(String filename) {
        String n = filename.toLowerCase();
        return n.endsWith(".mp3") || n.endsWith(".wav") || n.endsWith(".m4a") || n.endsWith(".aac")
                || n.endsWith(".flac") || n.endsWith(".ogg");
    }

    private static String pickExtension(String filename, String fallback) {
        int dot = filename.lastIndexOf('.');
        if (dot <= 0 || dot == filename.length() - 1) return fallback;
        String ext = filename.substring(dot).toLowerCase();
        return ext.length() > 8 ? fallback : ext;
    }

    private static MaterialFolderDTO toDTO(MaterialFolder f) {
        if (f == null) return null;
        return MaterialFolderDTO.builder()
                .id(f.getId()).code(f.getCode()).name(f.getName())
                .sortNo(f.getSortNo()).color(f.getColor()).description(f.getDescription())
                .refAudioOssKey(f.getRefAudioOssKey())
                .refAudioDurationMs(f.getRefAudioDurationMs())
                .refAudioFilename(f.getRefAudioFilename())
                .build();
    }
}
