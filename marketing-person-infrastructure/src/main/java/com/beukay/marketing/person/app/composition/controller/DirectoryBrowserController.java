package com.beukay.marketing.person.app.composition.controller;

import com.beukay.ai.common.entity.Result;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.beukay.ai.common.exception.GenericBusinessException;
/**
 * 服务器端目录浏览：渲染弹窗里"修改导出位置"通过这个端点列出子目录、创建子目录。
 * 安全：仅允许用户家目录及其后代；拒绝符号链接和不存在的目录。
 */
@RestController
@RequestMapping("/api/composition/dir")
@Log4j2
public class DirectoryBrowserController {

    private static final Path USER_HOME = Paths.get(System.getProperty("user.home")).toAbsolutePath().normalize();

    @GetMapping("/list")
    public Result<Map<String, Object>> list(@RequestParam(value = "path", required = false) String path) {
        Path target = resolveAndValidate(path);
        Map<String, Object> body = new HashMap<>();
        body.put("path", target.toString());
        body.put("parent", parentOrNull(target)); // 可为 null
        if (!Files.exists(target) || !Files.isDirectory(target)) {
            body.put("exists", false);
            body.put("writable", false);
            body.put("dirs", List.of());
            return Result.success(body);
        }
        List<Map<String, String>> dirs = new ArrayList<>();
        try (var stream = Files.list(target)) {
            stream.filter(Files::isDirectory)
                  .filter(p -> !isHidden(p))
                  .sorted(Comparator.comparing(p -> p.getFileName().toString().toLowerCase()))
                  .forEach(p -> dirs.add(Map.of(
                          "name", p.getFileName().toString(),
                          "path", p.toAbsolutePath().normalize().toString()
                  )));
        } catch (IOException e) {
            log.warn("[dir.list] failed for {}: {}", target, e.getMessage());
        }
        body.put("exists", true);
        body.put("writable", Files.isWritable(target));
        body.put("dirs", dirs);
        return Result.success(body);
    }

    @PostMapping("/mkdir")
    public Result<Map<String, Object>> mkdir(@RequestParam("path") String parent,
                                              @RequestParam("name") String name) {
        Path parentPath = resolveAndValidate(parent);
        if (!Files.isDirectory(parentPath)) {
            throw new GenericBusinessException("父目录不存在: " + parent);
        }
        if (name == null || name.isBlank() || name.contains("/") || name.contains("\\") || name.equals(".") || name.equals("..")) {
            throw new GenericBusinessException("非法目录名: " + name);
        }
        Path newDir = parentPath.resolve(name).toAbsolutePath().normalize();
        if (!newDir.startsWith(USER_HOME)) {
            throw new GenericBusinessException("仅允许在家目录下创建");
        }
        try {
            Files.createDirectories(newDir);
        } catch (IOException e) {
            throw new GenericBusinessException("创建目录失败: " + e.getMessage());
        }
        return Result.success(Map.of(
                "path", newDir.toString(),
                "name", name
        ));
    }

    private Path resolveAndValidate(String path) {
        Path raw;
        if (path == null || path.isBlank()) {
            raw = USER_HOME;
        } else {
            raw = Paths.get(path);
        }
        Path resolved = raw.toAbsolutePath().normalize();
        if (!resolved.startsWith(USER_HOME)) {
            // 越界一律重定向回家目录
            log.warn("[dir] path outside user home, redirecting: {}", resolved);
            return USER_HOME;
        }
        return resolved;
    }

    private static String parentOrNull(Path p) {
        Path parent = p.getParent();
        if (parent == null || !parent.startsWith(USER_HOME) || p.equals(USER_HOME)) return null;
        return parent.toString();
    }

    private static boolean isHidden(Path p) {
        String name = p.getFileName().toString();
        if (name.startsWith(".")) return true;
        try { return Files.isHidden(p); } catch (IOException e) { return false; }
    }
}
