package com.beukay.marketing.person.app.cutmatrix.linkingest;

import com.beukay.ai.common.entity.Result;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * link-ingest 卡片 REST 端点。
 * 与 catalog 中 backendPath /cm/link-ingest/* 对齐。
 */
@RestController
@RequiredArgsConstructor
@Log4j2
public class CmLinkIngestController {

    private final CmLinkIngestService service;

    /** 链接 → 解析结果（不下载） */
    @PostMapping("/cm/link-ingest/parse")
    public Result<List<CmLinkIngestDtos.ParseResultItem>> parse(@RequestBody CmLinkIngestDtos.ParseCmd cmd) {
        return Result.success(service.parse(cmd));
    }

    /** 解析后下载到 cm-storage，返回 assetCode */
    @PostMapping("/cm/link-ingest/download")
    public Result<CmLinkIngestDtos.DownloadResult> download(@RequestBody CmLinkIngestDtos.DownloadCmd cmd) {
        return Result.success(service.download(cmd));
    }

    /** 抽音 + ASR 转写 */
    @PostMapping("/cm/link-ingest/transcribe")
    public Result<CmLinkIngestDtos.TranscribeResult> transcribe(@RequestBody CmLinkIngestDtos.TranscribeCmd cmd) {
        return Result.success(service.transcribe(cmd));
    }

    /**
     * 兼容旧前端：一步提交，按现有 LinkIngest.tsx 行为生成 3 行任务（video/image/audio）。
     * 内部调 parse → 返回 mock 风格的 LinkIngestItem[]。
     */
    @PostMapping("/cm/link-ingest/create")
    public Result<List<CmLinkIngestDtos.ParseResultItem>> createCompat(@RequestBody CmLinkIngestDtos.ParseCmd cmd) {
        return Result.success(service.parse(cmd));
    }
}
