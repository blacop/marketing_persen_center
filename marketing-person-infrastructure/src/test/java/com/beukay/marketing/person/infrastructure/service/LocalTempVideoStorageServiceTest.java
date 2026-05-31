package com.beukay.marketing.person.infrastructure.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LocalTempVideoStorageServiceTest {

    @TempDir
    Path tempDir;

    @Test
    void shouldSaveUploadedFileIntoTaskScopedDirectory() throws IOException {
        LocalTempVideoStorageService service = new LocalTempVideoStorageService(tempDir);
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "demo.mp4",
                "video/mp4",
                "demo-video".getBytes()
        );

        Path stored = service.saveUpload("task-123", file);

        assertTrue(Files.exists(stored));
        assertEquals("demo.mp4", stored.getFileName().toString());
        assertEquals("task-123", stored.getParent().getParent().getFileName().toString());
        assertArrayEquals("demo-video".getBytes(), Files.readAllBytes(stored));
    }
}
