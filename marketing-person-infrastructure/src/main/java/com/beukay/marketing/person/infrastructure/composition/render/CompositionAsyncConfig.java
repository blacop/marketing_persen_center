package com.beukay.marketing.person.infrastructure.composition.render;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * 渲染异步线程池。
 * - 与项目现有 AgentAsyncConfig 区分（独立线程名 / 容量），避免互相阻塞
 * - parallelism 也作为 RenderPipeline 内信号量上限
 */
@Configuration
@EnableAsync
@RequiredArgsConstructor
public class CompositionAsyncConfig {

    private final CompositionRenderProperties props;

    @Bean(name = "compositionRenderExecutor")
    public Executor compositionRenderExecutor() {
        ThreadPoolTaskExecutor pool = new ThreadPoolTaskExecutor();
        int parallelism = Math.max(1, props.getParallelism());
        pool.setCorePoolSize(parallelism);
        pool.setMaxPoolSize(parallelism * 2);
        pool.setQueueCapacity(1000);
        pool.setThreadNamePrefix("composition-render-");
        pool.setWaitForTasksToCompleteOnShutdown(true);
        pool.setAwaitTerminationSeconds(30);
        pool.initialize();
        return pool;
    }
}
