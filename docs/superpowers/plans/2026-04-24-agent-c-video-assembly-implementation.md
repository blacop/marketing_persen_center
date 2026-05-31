# Agent C Video Assembly Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Agent C's first working retrieval-and-assembly slice so a `ScriptBlueprint` can produce candidate segment retrieval results, one recommended assembly plan, and a persisted assembly task.

**Architecture:** Add `VideoAssemblyTask`, `VideoAssemblyCandidate`, and `VideoAssemblyPlan` objects, use `ScriptBlueprintSection` plus existing `VideoSegment` rows to do rule-based semantic matching as an MVP, and expose `generate/get` APIs while leaving embedding/vector indexing as a later enhancement behind the same data model.

**Tech Stack:** Java 21, Spring Boot, COLA v4.0, MyBatis-Plus, MapStruct, JUnit 5.

---

### Task 1: Freeze Agent C object model

**Files:**
- Create: `marketing-person-client/src/main/java/com/beukay/marketing/person/client/api/VideoAssemblyFeign.java`
- Create: `marketing-person-client/src/main/java/com/beukay/marketing/person/client/cmd/VideoAssemblyGenerateCmd.java`
- Create: `marketing-person-client/src/main/java/com/beukay/marketing/person/client/dto/VideoAssemblyDTO.java`
- Create: `marketing-person-client/src/main/java/com/beukay/marketing/person/client/dto/VideoAssemblyCandidateDTO.java`
- Create: `marketing-person-client/src/main/java/com/beukay/marketing/person/client/dto/VideoAssemblyPlanSectionDTO.java`
- Create: `marketing-person-client/src/main/java/com/beukay/marketing/person/client/qry/VideoAssemblyDetailQry.java`
- Create: `marketing-person-domain/src/main/java/com/beukay/marketing/person/domain/videoAssembly/model/VideoAssemblyTask.java`
- Create: `marketing-person-domain/src/main/java/com/beukay/marketing/person/domain/videoAssembly/model/VideoAssemblyCandidate.java`
- Create: `marketing-person-domain/src/main/java/com/beukay/marketing/person/domain/videoAssembly/model/VideoAssemblyPlan.java`
- Create: `marketing-person-domain/src/main/java/com/beukay/marketing/person/domain/videoAssembly/gateway/VideoAssemblyTaskGateway.java`
- Create: `marketing-person-domain/src/main/java/com/beukay/marketing/person/domain/videoAssembly/gateway/VideoAssemblyCandidateGateway.java`
- Create: `marketing-person-domain/src/main/java/com/beukay/marketing/person/domain/videoAssembly/gateway/VideoAssemblyPlanGateway.java`
- Create: `marketing-person-domain/src/main/java/com/beukay/marketing/person/domain/videoAssembly/ability/VideoAssemblyTaskDomainService.java`
- Create: `marketing-person-domain/src/main/java/com/beukay/marketing/person/domain/videoAssembly/ability/impl/VideoAssemblyTaskDomainServiceImpl.java`
- Create: `marketing-person-dbsdk/src/main/java/com/beukay/marketing/person/dbsdk/model/VideoAssemblyTaskDO.java`
- Create: `marketing-person-dbsdk/src/main/java/com/beukay/marketing/person/dbsdk/model/VideoAssemblyCandidateDO.java`
- Create: `marketing-person-dbsdk/src/main/java/com/beukay/marketing/person/dbsdk/model/VideoAssemblyPlanDO.java`
- Create: `marketing-person-dbsdk/src/main/java/com/beukay/marketing/person/dbsdk/dao/VideoAssemblyTaskDOMapper.java`
- Create: `marketing-person-dbsdk/src/main/java/com/beukay/marketing/person/dbsdk/dao/VideoAssemblyCandidateDOMapper.java`
- Create: `marketing-person-dbsdk/src/main/java/com/beukay/marketing/person/dbsdk/dao/VideoAssemblyPlanDOMapper.java`
- Create: `marketing-person-dbsdk/src/main/resources/sql/V20260429__video_assembly.sql`

- [ ] Keep the first phase focused on `generate/get`; list/page can wait.
- [ ] Persist candidate retrieval rows separately from the final recommended plan.
- [ ] Store an MVP similarity score produced by rule-based keyword overlap now, but leave field naming generic enough for future embedding scores.

### Task 2: Drive assembly generation logic with a failing service test

**Files:**
- Create/Test: `marketing-person-infrastructure/src/test/java/com/beukay/marketing/person/app/service/VideoAssemblyGenerateAppServiceTest.java`
- Create: `marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/service/VideoAssemblyGenerateAppService.java`

- [ ] Write a failing test proving a `ScriptBlueprint` with 4 sections plus existing `VideoSegment` rows yields persisted candidates, one recommended assembly plan, and a `READY` task.
- [ ] Run `mvn test -q -pl marketing-person-infrastructure -am -DfailIfNoTests=false -Dsurefire.failIfNoSpecifiedTests=false -Dtest=VideoAssemblyGenerateAppServiceTest` and confirm failure.
- [ ] Implement the minimal scoring algorithm: keyword overlap across `queryText`, `mustCover`, `sellingPoint`, `scene`, `script`, `keyPhrase`, and `structureTag`; pick Top K per section, then choose one selected segment per section.
- [ ] Re-run the focused test until it passes.

### Task 3: Expose detail query and DTO conversion

**Files:**
- Create: `marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/convertor/VideoAssemblyDTOConvertor.java`
- Create: `marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/executor/VideoAssemblyDetailQryExecutor.java`
- Create/Test: `marketing-person-infrastructure/src/test/java/com/beukay/marketing/person/app/executor/VideoAssemblyDetailQryExecutorTest.java`
- Create: `marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/convertor/VideoAssemblyTaskConvertor.java`
- Create: `marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/convertor/VideoAssemblyCandidateConvertor.java`
- Create: `marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/convertor/VideoAssemblyPlanConvertor.java`
- Create: `marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/gatewayimpl/VideoAssemblyTaskGatewayImpl.java`
- Create: `marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/gatewayimpl/VideoAssemblyCandidateGatewayImpl.java`
- Create: `marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/gatewayimpl/VideoAssemblyPlanGatewayImpl.java`

- [ ] Add a failing detail-query test proving the API can return candidates, selected plan sections, and task summary.
- [ ] Implement gateway + DTO convertors and detail query executor.
- [ ] Re-run the focused detail test until it passes.

### Task 4: Expose generate/get API endpoints for Agent C

**Files:**
- Create: `marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/controller/VideoAssemblyController.java`
- Create: `marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/executor/VideoAssemblyCmdExecutor.java`

- [ ] Expose `generate` and `get` endpoints for Agent C.
- [ ] Keep the current implementation scoped to assembly planning; no real video rendering in this phase.

### Task 5: Verify and synchronize planning docs

**Files:**
- Modify: `task_plan.md`
- Modify: `findings.md`
- Modify: `progress.md`

- [ ] Run `mvn test -q -pl marketing-person-infrastructure -am -DfailIfNoTests=false -Dsurefire.failIfNoSpecifiedTests=false -Dtest=VideoAssemblyGenerateAppServiceTest,VideoAssemblyDetailQryExecutorTest`
- [ ] Run `mvn compile -q`
- [ ] Update planning files with Agent C MVP scope, including the fact that embedding/vector retrieval is deferred behind the same contract.
