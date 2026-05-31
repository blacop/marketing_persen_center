# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.


```bash
# Build all modules
mvn compile

# Clean build (use after switching branches or dependency changes)
mvn clean compile

# Run all tests
mvn test

# Run a single test class
mvn test -pl marketing-person-infrastructure -Dtest=SampleCacheManagerTest

# Run a single test method
mvn test -pl marketing-person-infrastructure -Dtest=SampleCacheManagerTest#shouldReturnDefaultKeyWhenGenerateKey

# Package (Spring Boot repackage)
mvn clean package -DskipTests
```

Note: Ensure your Maven `settings.xml` is configured with the correct private repository and local repo path for resolving `com.beukay:spring-ai-parent` and other internal dependencies.


本项目提供两套代码审查体系，适用于不同场景：


```bash
/quick-review
```

**适用场景**：
- 提交前审查 git diff 变更（推荐）
- 审查单个文件或目录
- 需要交互式修复问题

**特点**：
- 灵活指定审查范围
- 内联显示结果
- 支持询问是否修复

**使用的 Agent**：
- `code-reviewer`：检查架构合规性
- `code-style-checker`：检查编码规范


```bash
/full-review    # 一键执行三阶段流水线
```

或者分阶段执行：

```bash
/scan-code      # Stage 1: 扫描所有 Java 文件
/review-code    # Stage 2: 并行审查（架构 + 规范）
/review-report  # Stage 3: 生成 review-report.md
```

**适用场景**：
- CI/CD 流水线
- 全量代码审查
- 需要生成报告文件

**特点**：
- 全量扫描所有代码
- 三阶段流水线（可一键执行或分步执行）
- 并行执行（arch-reviewer + style-checker）
- 生成标准化报告文件（review-report.md）
- 评分机制（CRITICAL -10 分，WARNING -3 分）

**执行流程**：
1. Stage 1: code-scanner 扫描文件并分类（haiku）
2. Stage 2: arch-reviewer + style-checker 并行审查（sonnet）
3. Stage 3: review-reporter 生成最终报告（sonnet）

**每个 Stage 都有**：
- `SKILL.md`：执行说明
- `template.md`：输出模板
- `examples/sample.md`：示例输出
- `scripts/validate.sh`：格式验证脚本


| 场景 | 推荐方式 | 原因 |
|------|---------|------|
| 开发中修改代码 | `/quick-review` | 快速反馈，支持修复 |
| 提交前检查 | `/quick-review` | 只审查变更部分 |
| PR 前检查 | `/full-review` | 生成报告文件 |
| CI 环境 | `/full-review` | 标准化输出，适合自动化 |


COLA v4.0 (Clean Object-Oriented and Layered Architecture) with DDD, organized as four Maven modules:

```
marketing-person-center (parent POM, inherits from spring-ai-parent)
├── marketing-person-client       → Feign API interfaces, DTOs, Commands (cmd), Queries (qry)
├── marketing-person-domain       → Domain entities, domain services (ability), gateway interfaces
├── marketing-person-dbsdk        → MyBatis mapper interfaces, Data Objects (DO), mapper XML
└── marketing-person-infrastructure → Bootstrap app, controllers, executors, convertors, gateway impls
```


**Write**: `SampleFeign → SampleController → SampleCmdExecutor → SampleDomainService → SampleGateway → SampleGatewayImpl → SampleConvertor → SampleDOMapper → DB`

**Read**: `SampleFeign → SampleController → SampleQryExecutor → SampleGateway → SampleGatewayImpl → SampleConvertor → SampleDOMapper → DB → SampleDTOConvertor → SampleDTO`


| Layer | Module | Package | Contents |
|-------|--------|---------|----------|
| Client | marketing-person-client | `com.beukay.marketing.person.client.api` | Feign interfaces |
| | | `com.beukay.marketing.person.client.cmd` | Write commands |
| | | `com.beukay.marketing.person.client.qry` | Read queries |
| | | `com.beukay.marketing.person.client.dto` | Response DTOs |
| Domain | marketing-person-domain | `com.beukay.marketing.person.domain.{agg}.model` | Entities, value objects, criteria queries |
| | | `com.beukay.marketing.person.domain.{agg}.ability` | Domain service interfaces |
| | | `com.beukay.marketing.person.domain.{agg}.ability.impl` | Domain service implementations |
| | | `com.beukay.marketing.person.domain.{agg}.gateway` | Gateway interfaces (repository ports) |
| | | `com.beukay.marketing.person.domain.shared` | Shared domain events |
| DB SDK | marketing-person-dbsdk | `com.beukay.marketing.person.dbsdk.dao` | MyBatis mapper interfaces |
| | | `com.beukay.marketing.person.dbsdk.model` | Data Objects (DO) |
| Infra | marketing-person-infrastructure | `com.beukay.marketing.person.app.controller` | REST controllers (impl Feign) |
| | | `com.beukay.marketing.person.app.executor` | Cmd/Qry executors |
| | | `com.beukay.marketing.person.app.convertor` | Domain → DTO convertors |
| | | `com.beukay.marketing.person.app.config` | Cache managers, Spring config |
| | | `com.beukay.marketing.person.infrastructure.convertor` | Domain ↔ DO convertors (MapStruct) |
| | | `com.beukay.marketing.person.infrastructure.gatewayimpl` | Gateway implementations |
| | | `com.beukay.marketing.person.infrastructure.event` | Event publishers |


`marketing-person-infrastructure` → `marketing-person-client`, `marketing-person-domain`, `marketing-person-dbsdk` (infrastructure depends on all others; only infrastructure has the Spring Boot main class and is the deployable artifact).


Tests are plain JUnit 5 without Spring context boot — use testable subclasses or direct instantiation rather than `@SpringBootTest`. Tests live under `marketing-person-infrastructure/src/test/`.


- `com.beukay.ai.common.entity.Entity<T>` — base domain entity with id, operator, baseFields
- `com.beukay.ai.common.entity.BaseFields` — audit fields (createAt/By, updateAt/By, nezha_tenant_code, isDeleted)
- `com.beukay.ai.common.entity.Result<T>` — standard API response wrapper
- `com.beukay.ai.common.entity.PageInfo<T>` / `PageQuery` — pagination
- `com.beukay.ai.common.entity.Operator` — user context (operatorId, operatorName)
- `com.beukay.ai.common.convertor.BaseConvertor<S,T>` — MapStruct base with `to()` / `from()` methods
- `com.beukay.ai.common.mybatis.util.PageUtil` — pagination conversion utilities


**Domain Entity**: Extends `Entity<Long>`, uses `@SuperBuilder @Data @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode(callSuper = true)`.

**Convertor (Domain ↔ DO)**: MapStruct `@Mapper(uses = BooleanStrategy.class)` extending `BaseConvertor<Domain, DO>`. Map `baseFields.*` fields explicitly. Ignore `operator` on `from()`.

**Convertor (Domain → DTO)**: MapStruct `@Mapper` with `default` method that manually builds the DTO via builder.

**Controller**: `@RestController @RequiredArgsConstructor`, implements the Feign interface, delegates to CmdExecutor / QryExecutor.

**Executor**: `@Component @RequiredArgsConstructor @Log4j2`. CmdExecutor handles writes, QryExecutor handles reads.

**Gateway Impl**: `@Component @RequiredArgsConstructor`, implements domain Gateway interface, uses Convertor + DOMapper.

**MyBatis Mapper XML**: Located at `marketing-person-dbsdk/src/main/resources/com/beukay/marketing/person/dbsdk/dao/`. All queries include `is_deleted = 0` for soft delete.


- Java 21, Spring Boot, Spring Cloud (Nacos config/discovery, OpenFeign)
- COLA v4.0.1, MyBatis-Plus, MapStruct 1.6.3 + Lombok 1.18.42
- Log4j2 (async), HikariCP, Hutool
- Server port: 30000 (env var PORT), app name: marketing-person-center
