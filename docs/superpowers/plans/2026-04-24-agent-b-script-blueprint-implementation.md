# Agent B Script Blueprint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Agent B's first working `ScriptBlueprint` vertical slice so product input plus knowledge assets can produce candidate templates, one recommended template, and a dynamic semantic blueprint with section records.

**Architecture:** Add a new `script_blueprint` main object plus `script_blueprint_section` child rows, generate candidate/recommended template summaries in the app service using existing `content_pattern_knowledge` and `product_truth`, and expose `generate/get` endpoints without yet extracting a separate persistent `ScriptTemplate` library.

**Tech Stack:** Java 21, Spring Boot, COLA v4.0, MyBatis-Plus, MapStruct, JUnit 5.

---

### Task 1: Freeze Agent B first-phase object model

**Files:**
- Create: `marketing-person-client/src/main/java/com/beukay/marketing/person/client/api/ScriptBlueprintFeign.java`
- Create: `marketing-person-client/src/main/java/com/beukay/marketing/person/client/cmd/ScriptBlueprintGenerateCmd.java`
- Create: `marketing-person-client/src/main/java/com/beukay/marketing/person/client/dto/ScriptBlueprintDTO.java`
- Create: `marketing-person-client/src/main/java/com/beukay/marketing/person/client/dto/ScriptBlueprintSectionDTO.java`
- Create: `marketing-person-client/src/main/java/com/beukay/marketing/person/client/dto/ScriptTemplateCandidateDTO.java`
- Create: `marketing-person-client/src/main/java/com/beukay/marketing/person/client/qry/ScriptBlueprintDetailQry.java`
- Create: `marketing-person-domain/src/main/java/com/beukay/marketing/person/domain/scriptBlueprint/model/ScriptBlueprint.java`
- Create: `marketing-person-domain/src/main/java/com/beukay/marketing/person/domain/scriptBlueprint/model/ScriptBlueprintSection.java`
- Create: `marketing-person-domain/src/main/java/com/beukay/marketing/person/domain/scriptBlueprint/gateway/ScriptBlueprintGateway.java`
- Create: `marketing-person-domain/src/main/java/com/beukay/marketing/person/domain/scriptBlueprint/gateway/ScriptBlueprintSectionGateway.java`
- Create: `marketing-person-domain/src/main/java/com/beukay/marketing/person/domain/scriptBlueprint/ability/ScriptBlueprintDomainService.java`
- Create: `marketing-person-domain/src/main/java/com/beukay/marketing/person/domain/scriptBlueprint/ability/impl/ScriptBlueprintDomainServiceImpl.java`
- Create: `marketing-person-dbsdk/src/main/java/com/beukay/marketing/person/dbsdk/model/ScriptBlueprintDO.java`
- Create: `marketing-person-dbsdk/src/main/java/com/beukay/marketing/person/dbsdk/model/ScriptBlueprintSectionDO.java`
- Create: `marketing-person-dbsdk/src/main/java/com/beukay/marketing/person/dbsdk/dao/ScriptBlueprintDOMapper.java`
- Create: `marketing-person-dbsdk/src/main/java/com/beukay/marketing/person/dbsdk/dao/ScriptBlueprintSectionDOMapper.java`
- Create: `marketing-person-dbsdk/src/main/resources/sql/V20260428__script_blueprint.sql`

- [ ] Add `script_blueprint` fields for candidate/recommended template summary, blueprint JSON, summary, logic trace, and auto-flow status.
- [ ] Add `script_blueprint_section` fields for semantic-stage execution inputs (`stageName`, `goal`, `semanticIntent`, `queryText`, `mustCoverJson`, `preferredSignalsJson`, `avoidSignalsJson`, `durationMin`, `durationMax`, `narrationHint`).
- [ ] Keep candidate templates in first phase as JSON/DTO payloads on the blueprint object; defer separate persistent template library extraction to the next Agent B phase.

### Task 2: Drive blueprint generation logic with a failing service test

**Files:**
- Create/Test: `marketing-person-infrastructure/src/test/java/com/beukay/marketing/person/app/service/ScriptBlueprintGenerateAppServiceTest.java`
- Create: `marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/service/ScriptBlueprintGenerateAppService.java`

- [ ] Write a failing test that proves `generate(...)` creates one blueprint with template candidates, one recommended template, and 4-5 semantic sections derived from knowledge and product truth.
- [ ] Run `mvn test -q -pl marketing-person-infrastructure -am -DfailIfNoTests=false -Dsurefire.failIfNoSpecifiedTests=false -Dtest=ScriptBlueprintGenerateAppServiceTest` and confirm failure.
- [ ] Implement the minimal generation rules: score top knowledge entries into candidate templates, choose one recommended template, derive dynamic sections, and persist both blueprint and sections.
- [ ] Re-run the focused test until it passes.

### Task 3: Wire persistence, convertors, and detail query

**Files:**
- Create: `marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/convertor/ScriptBlueprintConvertor.java`
- Create: `marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/convertor/ScriptBlueprintSectionConvertor.java`
- Create: `marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/gatewayimpl/ScriptBlueprintGatewayImpl.java`
- Create: `marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/gatewayimpl/ScriptBlueprintSectionGatewayImpl.java`
- Create: `marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/convertor/ScriptBlueprintDTOConvertor.java`
- Create/Test: `marketing-person-infrastructure/src/test/java/com/beukay/marketing/person/app/executor/ScriptBlueprintDetailQryExecutorTest.java`
- Create: `marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/executor/ScriptBlueprintDetailQryExecutor.java`

- [ ] Write a failing detail-query test proving returned DTO contains candidate templates, recommended template summary, and ordered section list.
- [ ] Implement gateway and DTO convertors.
- [ ] Implement detail query executor using the new gateways.
- [ ] Re-run the focused detail test until it passes.

### Task 4: Expose generate/get API endpoints for Agent B

**Files:**
- Create: `marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/controller/ScriptBlueprintController.java`
- Create: `marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/executor/ScriptBlueprintCmdExecutor.java`

- [ ] Add `generate` and `get` endpoints mirroring current COLA controller style.
- [ ] Keep `ContentStructureCard` endpoints intact for now; Agent B's new API lives alongside them until callers migrate.
- [ ] Reuse DTO convertor logic so command and query responses stay consistent.

### Task 5: Verify and synchronize planning docs

**Files:**
- Modify: `task_plan.md`
- Modify: `findings.md`
- Modify: `progress.md`

- [ ] Run `mvn test -q -pl marketing-person-infrastructure -am -DfailIfNoTests=false -Dsurefire.failIfNoSpecifiedTests=false -Dtest=ScriptBlueprintGenerateAppServiceTest,ScriptBlueprintDetailQryExecutorTest`
- [ ] Run `mvn compile -q`
- [ ] Update planning files with first-phase Agent B scope, note that persistent `ScriptTemplate` library extraction is deferred.
