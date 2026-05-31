# Agent A Pattern Candidates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade Agent A so video deconstruction produces transparent `Top N` candidate patterns, a recommended pattern, and persisted decision evidence.

**Architecture:** Extend `video_deconstruction_result` with recommended-pattern summary fields, add a new `video_pattern_candidate` aggregate for candidate persistence, and teach the rule-based deconstruction engine plus application/query layers to emit the unified `候选集 -> 推荐项 -> 最终产物` structure.

**Tech Stack:** Java 21, Spring Boot, COLA v4.0, MyBatis-Plus, MapStruct, JUnit 5.

---

### Task 1: Freeze persistence and contract changes for Agent A

**Files:**
- Create: `marketing-person-client/src/main/java/com/beukay/marketing/person/client/dto/VideoPatternCandidateDTO.java`
- Create: `marketing-person-domain/src/main/java/com/beukay/marketing/person/domain/videoPatternCandidate/model/VideoPatternCandidate.java`
- Create: `marketing-person-domain/src/main/java/com/beukay/marketing/person/domain/videoPatternCandidate/gateway/VideoPatternCandidateGateway.java`
- Create: `marketing-person-domain/src/main/java/com/beukay/marketing/person/domain/videoPatternCandidate/ability/VideoPatternCandidateDomainService.java`
- Create: `marketing-person-domain/src/main/java/com/beukay/marketing/person/domain/videoPatternCandidate/ability/impl/VideoPatternCandidateDomainServiceImpl.java`
- Create: `marketing-person-dbsdk/src/main/java/com/beukay/marketing/person/dbsdk/model/VideoPatternCandidateDO.java`
- Create: `marketing-person-dbsdk/src/main/java/com/beukay/marketing/person/dbsdk/dao/VideoPatternCandidateDOMapper.java`
- Create: `marketing-person-dbsdk/src/main/resources/sql/V20260427__video_pattern_candidate.sql`
- Modify: `marketing-person-client/src/main/java/com/beukay/marketing/person/client/dto/VideoDeconstructionDTO.java`
- Modify: `marketing-person-domain/src/main/java/com/beukay/marketing/person/domain/videoDeconstructionResult/model/VideoDeconstructionResult.java`
- Modify: `marketing-person-dbsdk/src/main/java/com/beukay/marketing/person/dbsdk/model/VideoDeconstructionResultDO.java`

- [ ] Add DTO/domain/DO fields for `recommendedPatternCode`, `recommendedPatternName`, `recommendedPatternReason`, `patternDecisionJson`, and `patternCandidates`.
- [ ] Add `video_pattern_candidate` table with soft-delete/audit fields, `record_id`, `deconstruction_result_id`, `pattern_code`, `pattern_name`, `match_score`, `reason_json`, `rank_no`, `is_recommended`.
- [ ] Keep naming aligned with existing video aggregates so later Agent B/C objects can reuse the same candidate/recommended mental model.

### Task 2: Drive rule engine changes with tests first

**Files:**
- Modify/Test: `marketing-person-infrastructure/src/test/java/com/beukay/marketing/person/infrastructure/service/RuleBasedVideoDeconstructionEngineTest.java`
- Modify: `marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/service/RuleBasedVideoDeconstructionEngine.java`

- [ ] Write a failing test asserting the engine returns multiple ranked pattern candidates plus a recommended pattern summary for a technical-proof title.
- [ ] Run `mvn test -q -pl marketing-person-infrastructure -am -Dtest=RuleBasedVideoDeconstructionEngineTest` and confirm the new assertion fails for the expected missing fields.
- [ ] Implement the smallest `analyze(...)`/decision model needed so the engine can score pattern candidates, sort Top N, mark one as recommended, and write decision evidence into `VideoDeconstructionResult`.
- [ ] Re-run the same test until it passes.

### Task 3: Persist candidate patterns in Agent A app service

**Files:**
- Modify/Test: `marketing-person-infrastructure/src/test/java/com/beukay/marketing/person/app/service/VideoKnowledgeBuildAppServiceTest.java`
- Modify: `marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/service/VideoKnowledgeBuildAppService.java`
- Modify: `marketing-person-domain/src/main/java/com/beukay/marketing/person/domain/videoDeconstructionResult/gateway/VideoDeconstructionResultGateway.java`
- Create: `marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/convertor/VideoPatternCandidateConvertor.java`
- Create: `marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/gatewayimpl/VideoPatternCandidateGatewayImpl.java`

- [ ] Extend the service test to fail unless `deconstruct(...)` stores both the main result and ranked `VideoPatternCandidate` rows.
- [ ] Run `mvn test -q -pl marketing-person-infrastructure -am -Dtest=VideoKnowledgeBuildAppServiceTest` and confirm failure.
- [ ] Implement batch persistence for candidates after the result row is inserted, linking each candidate to `recordId` and `deconstructionResultId`.
- [ ] Re-run the focused service test until it passes.

### Task 4: Expose candidate transparency in query/command responses

**Files:**
- Create: `marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/convertor/VideoPatternCandidateDTOConvertor.java`
- Modify: `marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/convertor/VideoDeconstructionDTOConvertor.java`
- Modify: `marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/executor/VideoDeconstructionCmdExecutor.java`
- Modify: `marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/executor/VideoDeconstructionDetailQryExecutor.java`
- Optionally modify: `marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/service/VideoUnderstandingTaskAppService.java`

- [ ] Add a failing test (or extend existing service/executor tests if cheaper) proving returned `VideoDeconstructionDTO` includes recommended-pattern summary plus candidate list.
- [ ] Implement DTO convertors and executor wiring so `deconstruct` and `get` return the transparent structure.
- [ ] Keep async temporary task results backward compatible; if touched, only add lightweight candidate summary without changing task-state behavior.

### Task 5: Verify and document phase completion

**Files:**
- Modify: `task_plan.md`
- Modify: `findings.md`
- Modify: `progress.md`

- [ ] Run `mvn test -q -pl marketing-person-infrastructure -am -Dtest=RuleBasedVideoDeconstructionEngineTest,VideoKnowledgeBuildAppServiceTest`
- [ ] Run `mvn compile -q`
- [ ] Update planning files with what shipped in this phase, including the new SQL migration and any deferred async-path gaps.
