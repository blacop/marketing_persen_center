package com.beukay.marketing.person.app.composition.controller;

import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.app.composition.executor.MaterialFolderCmdExecutor;
import com.beukay.marketing.person.client.composition.dto.MaterialFolderDTO;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import java.io.IOException;
import java.util.List;

import com.beukay.ai.common.exception.GenericBusinessException;
/**
 * 文件夹批量导入。
 * 用 HttpServletRequest 接收 multipart（不直接在签名暴露 MultipartFile[]），
 * 避免上游 ControllerLogAspect 序列化 MultipartFile 时的无限递归 bug。
 */
@RestController
@RequiredArgsConstructor
@Log4j2
@RequestMapping("/api/material-folder-import")
public class MaterialFolderImportController {

    private final MaterialFolderCmdExecutor cmdExecutor;

    @PostMapping
    public Result<List<MaterialFolderDTO>> importFromFolder(HttpServletRequest request) throws IOException {
        if (!(request instanceof MultipartHttpServletRequest mp)) {
            throw new GenericBusinessException("expect multipart/form-data request");
        }
        List<MultipartFile> files = mp.getFiles("file");
        String[] paths = mp.getParameterValues("path");
        String[] subDirs = mp.getParameterValues("subDir");
        int fc = files == null ? 0 : files.size();
        int pc = paths == null ? 0 : paths.length;
        int sc = subDirs == null ? 0 : subDirs.length;
        if (fc != pc) {
            throw new GenericBusinessException("file/path count mismatch: files=" + fc + " paths=" + pc);
        }
        if (fc == 0 && sc == 0) {
            throw new GenericBusinessException("nothing to import: no files and no subDir");
        }
        log.info("[folder.import] receiving files={} subDirs={}", fc, sc);
        return Result.success(cmdExecutor.importFromFolder(
                files == null ? new MultipartFile[0] : files.toArray(new MultipartFile[0]),
                paths == null ? new String[0] : paths,
                subDirs));
    }
}
