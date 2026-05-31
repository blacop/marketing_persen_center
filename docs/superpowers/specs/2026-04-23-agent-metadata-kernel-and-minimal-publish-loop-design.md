# Agent Metadata Kernel and Minimal Publish Loop Design

- Date: 2026-04-23
- Repository: `/Users/any/Documents/code/beukay/marketing-person-center`
- Status: Approved in chat, written spec pending user review
- Scope: Layer 3 first sub-project — strengthen the Spring Boot Agent metadata kernel and deliver one minimal end-to-end publish loop to Hermes

## 1. Background

The repository already has a stable COLA/CQRS-style backend scaffold, Hermes local skills integration, and one validation aggregate (`KolPerson`) generated successfully. The current backend exposes CRUD-like create/list flows for these Agent-related aggregates:

- `AgentDefinition`
- `AgentIdentity`
- `AgentRegistry`
- `AgentTrace`
- `SkillRegistry`
- `KolPerson`

At the current stage, the technical base is in place but the business layer is still early. The existing code is strong as a scaffold but weak as an operational Agent platform:

- most aggregates only support `create + listPage`
- domain services are mostly pass-through
- publish/runtime relationships are implicit rather than modeled
- there is no minimal closed loop from Agent definition to Hermes-executable skill artifact
- tracing exists as a concept but not yet as a full publish/execution audit trail

The next step is not a full product build. It is to turn the current scaffold into a usable **Agent metadata kernel** that can support future upper-layer applications and Agent Studio capabilities.

## 2. Goal

Build the first production-worthy Agent base layer by:

1. strengthening the existing Agent metadata aggregates
2. introducing explicit publish modeling
3. exposing the missing detail/update/publish APIs
4. generating a deterministic `SKILL.md` artifact from `AgentDefinition`
5. publishing that artifact into Hermes local skills directories
6. automatically registering the published result into `SkillRegistry` and `AgentRegistry`
7. recording the full publish trace for audit and retry

This phase should deliver one minimal but real closed loop:

`AgentDefinition -> generate SKILL.md -> publish to Hermes -> register runtime metadata -> write trace`

## 3. Non-goals

The following are intentionally out of scope for this phase:

- multi-environment publish (`dev/test/prod`)
- remote Hermes cluster publish
- webhook-triggered publish
- cron-based publish scheduling
- full Gateway enforcement for `AgentIdentity`
- deep OpenTelemetry rollout across runtime execution
- online rich Studio UI editing workflow
- rollback orchestration across multiple releases
- generalized workflow engine/orchestration engine
- replacing the existing four-module Maven structure

These may be added later, but this phase must stay focused on a single implementable base-layer slice.

## 4. Recommended approach

Use **metadata kernel first + minimal publish loop**.

Why this approach:

- it matches the current maturity of the repository
- it reuses the existing COLA layering instead of fighting it
- it produces a demonstrable business outcome without overbuilding runtime orchestration
- it creates stable domain/application boundaries for future Studio, Gateway, webhook, cron, and OTel work

## 5. High-level architecture

This phase treats the system as four cooperating parts:

1. **AgentDefinition** — editable source-of-truth for business-defined Agent behavior
2. **Publish pipeline** — deterministic generation and local Hermes publication
3. **Runtime registries** — `SkillRegistry` and `AgentRegistry` as discoverable runtime metadata views
4. **Identity and observability base** — `AgentIdentity` and `AgentTrace` as future-safe support layers

### 5.1 Architectural principle

Database entities are the source of truth. Generated files are runtime artifacts. The system must be able to regenerate artifacts from database state, rather than treating `SKILL.md` as the primary editable source.

### 5.2 Layering principle

Keep the existing four Maven modules and stay aligned with current COLA conventions:

- `client`: API contracts and DTOs
- `domain`: aggregates, domain services, gateway ports
- `dbsdk`: DOs, mappers, XML
- `infrastructure`: controllers, executors, app services, artifact generation, publishers, gateway implementations

No new Maven module is needed in this phase.

## 6. Domain model

## 6.1 Core aggregates after this phase

The kernel will consist of six core aggregates:

1. `AgentDefinition`
2. `AgentIdentity`
3. `AgentRegistry`
4. `SkillRegistry`
5. `AgentTrace`
6. `AgentPublishRecord` (**new**)

`KolPerson` remains a validation/business aggregate but is not part of the Agent kernel.

## 6.2 Aggregate responsibilities

### AgentDefinition
Represents the editable business definition of an Agent.

Responsibilities:

- human-facing name and description
- behavior DSL / instruction body
- model configuration payload
- business rules payload
- linked skills or capabilities
- version and publish lifecycle
- current publication status

This is the primary source object used by Agent Studio and later business applications.

### AgentIdentity
Represents the execution identity and ownership metadata of an Agent.

Responsibilities:

- unique encrypted or external-facing agent identifier
- owner/team information
- agent type
- public key / credential reference
- authorization policy

This phase only builds the metadata model and CRUD/read APIs; Gateway enforcement is deferred.

### SkillRegistry
Represents a published skill artifact that Hermes can discover or consume.

Responsibilities:

- skill unique identifier
- source type
- artifact path
- checksum
- schema version
- version metadata
- category and trust metadata

This is the runtime skill view, not the authoring source object.

### AgentRegistry
Represents the runtime discoverability entry for a publishable Agent.

Responsibilities:

- runtime-visible Agent registration
- linked definition/version
- linked identity
- current active skill
- endpoint type
- category/status/version

This is the runtime Agent view, not the editable draft.

### AgentTrace
Represents trace information for publish and later execution flows.

Responsibilities in this phase:

- publish trace lifecycle
- success/failure outcome
- timing fields
- links to definition/registry/publish record
- error message capture

In later phases it can expand to runtime execution traces and OpenTelemetry bridging.

### AgentPublishRecord (new)
Represents the immutable fact of a publish attempt and its artifact output.

Responsibilities:

- which definition/version was published
- which skill identifier/artifact path/checksum was produced
- which publisher implementation handled the release
- whether that release succeeded or failed
- what error occurred, if any

This aggregate separates release facts from generic tracing. It is required for retries, audit clarity, and future rollback support.

## 6.3 Relationships

Recommended logical relationships:

- `AgentDefinition` has many `AgentPublishRecord`
- `AgentDefinition` can produce one or more `SkillRegistry` versions over time
- `AgentRegistry` points to the current runtime mapping for an `AgentDefinition`
- `AgentRegistry` runs under one `AgentIdentity`
- `AgentTrace` can reference `AgentDefinition`, `AgentRegistry`, and `AgentPublishRecord`

## 7. State model

## 7.1 AgentDefinition state

Use a dual-state model.

### Lifecycle status
- `ACTIVE`
- `INACTIVE`

### Publish status
- `DRAFT`
- `PUBLISHED`
- `FAILED`
- `ARCHIVED`

Rules:

- new or edited definitions are `DRAFT`
- successful publish sets `PUBLISHED`
- publish failure sets `FAILED`
- archived definitions cannot be published again until explicitly restored by later work
- any material edit to a previously published definition returns it to `DRAFT`

## 7.2 SkillRegistry state

Keep `status` with:

- `ACTIVE`
- `INACTIVE`

Retain `source` and support at least:

- `BUILTIN`
- `LOCAL`
- `HUB`
- `MCP`

This phase uses `LOCAL` for generated Hermes skills.

## 7.3 AgentRegistry state

Use:

- `ACTIVE`
- `INACTIVE`
- `SUSPENDED`

This supports runtime gating later without redesign.

## 7.4 AgentTrace state

Add two dimensions:

### Trace type
- `PUBLISH`
- `EXECUTION`

### Trace status
- `RUNNING`
- `SUCCESS`
- `FAILED`

This phase primarily emits `PUBLISH` traces.

## 7.5 AgentPublishRecord state

Use:

- `SUCCESS`
- `FAILED`

Each retry creates a new publish record rather than overwriting history.

## 8. Data model changes

## 8.1 AgentDefinition new fields

Extend the current model with:

- `version`
- `publishStatus`
- `lastPublishAt`
- `lastPublishBy`

If `deployStatus` already exists, it should be either renamed or semantically aligned to `publishStatus`. The design recommendation is to standardize on `publishStatus` to avoid ambiguity.

## 8.2 AgentRegistry new fields

Add:

- `definitionId`
- `definitionVersion`
- `identityId`
- `currentSkillId`
- `endpointType`

Recommended initial `endpointType` support:

- `HERMES_SKILL`

## 8.3 SkillRegistry new fields

Add:

- `artifactPath`
- `artifactChecksum`
- `schemaVersion`

## 8.4 AgentTrace new fields

Add:

- `traceType`
- `traceStatus`
- `definitionId`
- `registryId`
- `publishRecordId`
- `startAt`
- `endAt`

Existing `traceId`, `result`, `errorMsg`, and duration-related fields can remain and should be aligned with the new trace lifecycle.

## 8.5 New AgentPublishRecord model

Recommended fields:

- `id`
- `definitionId`
- `definitionVersion`
- `skillId`
- `artifactPath`
- `artifactChecksum`
- `publisherType`
- `publishStatus`
- `errorMsg`
- audit/base fields via existing common entity model

## 8.6 Persistence strategy

- add corresponding DO, Mapper, and Mapper XML for `AgentPublishRecord`
- extend existing DOs/Mappers/XMLs for the new fields above
- keep soft-delete discipline by retaining `is_deleted = 0` in all custom queries
- this phase does not require Flyway rollout automation yet, but the design assumes SQL schema migration scripts will be added during implementation

## 9. API contract changes

The current `create + listPage` API surface is insufficient. The first kernel phase should add a minimal but useful set of actions.

## 9.1 AgentDefinition API

Add or complete:

- `create`
- `update`
- `getById`
- `listPage`
- `publish`
- `retryPublish`
- `archive`

Recommended request objects:

- `AgentDefinitionUpdateCmd`
- `AgentDefinitionPublishCmd`
- `AgentDefinitionRetryPublishCmd`
- `AgentDefinitionDetailQry`

## 9.2 AgentIdentity API

Add or complete:

- `create`
- `update`
- `getById`
- `listPage`

Do not implement credential rotation behavior yet, but reserve space in the domain for later extension.

## 9.3 AgentRegistry API

Add or complete:

- `getById`
- `listPage`
- `activate`
- `suspend`
- `queryByAgentUniqueId`

## 9.4 SkillRegistry API

Add or complete:

- `getById`
- `listPage`
- `queryBySkillId`

Do not expose internal publish-upsert behavior as a public API unless a real external caller needs it.

## 9.5 AgentTrace API

Add or complete:

- `getById`
- `listPage`
- `listByDefinitionId`
- `listByTraceType`

## 9.6 AgentPublishRecord API

New APIs:

- `getById`
- `listPage`
- `listByDefinitionId`

Recommended DTOs/queries:

- `AgentPublishRecordDTO`
- `AgentPublishRecordPageQry`
- `AgentTraceDetailQry`

## 10. Minimal publish loop

The first real business loop is:

1. create or update an `AgentDefinition`
2. call publish
3. generate a deterministic `SKILL.md`
4. write project-local generated artifact files
5. publish those files into Hermes local skills directory
6. upsert `SkillRegistry`
7. upsert `AgentRegistry`
8. create `AgentPublishRecord`
9. update `AgentDefinition.publishStatus`
10. complete `AgentTrace`

## 10.1 Publish command

Primary command:

`POST /agentDefinition/publish`

Recommended input:

- `definitionId`
- optional `publishVersion`
- operator metadata should come from context later; in this phase existing fallback system operator behavior may be temporarily retained if no context is available

Recommended output:

- `publishRecordId`
- `traceId`
- `skillId`
- `agentRegistryId`
- `publishStatus`

## 10.2 Retry publish command

Secondary command:

`POST /agentDefinition/retryPublish`

Rules:

- retry creates a new trace and a new publish record
- retry does not mutate old release history
- retry should reuse the current definition snapshot or a selected previous publish record, depending on request shape chosen during implementation

The key requirement is that retries remain auditable as fresh publish attempts.

## 11. Artifact generation strategy

## 11.1 Source of truth

`AgentDefinition` is the source of truth. `SKILL.md` is a generated runtime artifact.

This is a hard requirement. Operators must not treat the generated Markdown file as the authoritative editable model.

## 11.2 Generation format

`SkillArtifactGenerator` should render a deterministic `SKILL.md` template from structured AgentDefinition fields.

Recommended sections:

```md
---
name: <agent-name>
description: <agent-description>
version: <version>
source: beukay-agent-studio
---

# Purpose
...

# Inputs
...

# Workflow
1. ...
2. ...
3. ...

# Constraints
...

# Output
...
```

The final exact template may evolve, but the first version must be deterministic, easy to diff, and consistent across releases.

## 11.3 Why structured generation

Benefits:

- artifacts can be regenerated from DB state
- later template versions can coexist safely
- future Studio forms can stay structured rather than freeform Markdown
- audit and testing are easier than with human-edited artifact files

## 12. Publication strategy

## 12.1 Publisher abstraction

Introduce a publication port:

- `SkillPublisher`

First implementation:

- `HermesLocalSkillPublisher`

This keeps publication strategy pluggable for later remote, multi-env, or hub-based publication.

## 12.2 Project-local artifact directory

Generated artifacts should be written first into the repository for audit/debug visibility:

`/Users/any/Documents/code/beukay/marketing-person-center/hermes/generated-skills/<skillId>/`

Recommended contents:

- `SKILL.md`
- `metadata.json`

## 12.3 Hermes runtime directory

Then publish into the runtime-discoverable Hermes local directory:

`~/.hermes/skills/beukay/generated/<skillId>/`

Recommended contents:

- `SKILL.md`

This preserves both:

- a project-side build artifact record
- a runtime-side consumable skill location

## 12.4 metadata.json

Recommended fields:

- `definitionId`
- `definitionVersion`
- `skillId`
- `checksum`
- `publishedAt`
- `publishedBy`
- `templateVersion`

This file is not the source of truth but helps debugging and operations.

## 13. Failure handling and retry model

This phase should not introduce distributed transaction complexity, but it must provide predictable recovery semantics.

## 13.1 Publish sequence rule

Prefer this order:

1. validate definition
2. create running trace
3. generate artifact
4. write project-local artifact files
5. publish Hermes runtime files
6. persist registry and publish record results
7. mark success

Rationale:

If the database says publish succeeded but Hermes files are missing, the system creates a false success state that is harder to recover from. File generation/publication must happen before success is recorded.

## 13.2 Failure cases

Expected failures include:

- invalid definition state
- template render failure
- local file write failure
- Hermes directory sync failure
- registry/publish record persistence failure

## 13.3 Failure behavior

On failure:

- mark `AgentDefinition.publishStatus = FAILED`
- mark `AgentTrace.traceStatus = FAILED`
- create or update `AgentPublishRecord` with `FAILED` if creation has already passed that stage
- persist the error message
- preserve successfully generated local artifact files when available so troubleshooting and retry are possible

## 13.4 Retry behavior

Retry must be modeled as a new publish attempt:

- new `AgentTrace`
- new `AgentPublishRecord`
- new timing and outcome
- existing failed records remain immutable history

## 14. Application and package structure

Keep the existing Maven modules and add focused classes in the infrastructure layer.

## 14.1 client module additions

Add new commands/queries/DTOs for:

- definition update/detail/publish/retry
- publish record paging/detail
- trace detail access

## 14.2 domain module additions

Add a new aggregate namespace:

- `com.beukay.marketing.person.domain.agentPublishRecord`

Retain existing aggregate package conventions for model, ability, gateway.

## 14.3 dbsdk module additions

Add:

- `AgentPublishRecordDO`
- `AgentPublishRecordDOMapper`
- `AgentPublishRecordDOMapper.xml`

Extend current definition/registry/skill/trace persistence models with the new fields described above.

## 14.4 infrastructure module additions

### app/controller
Complete or add:

- `AgentDefinitionController` publish/retry/detail/update
- `AgentTraceController` detail query
- `AgentPublishRecordController`

### app/executor
Add executors such as:

- `AgentDefinitionPublishCmdExecutor`
- `AgentDefinitionUpdateCmdExecutor`
- `AgentDefinitionDetailQryExecutor`
- `AgentPublishRecordQryExecutor`

### app/service
Add a cross-aggregate application service package and class:

- `com.beukay.marketing.person.app.service.AgentPublishAppService`

This service orchestrates the publish loop across multiple aggregates and infrastructure capabilities.

### infrastructure/generator
Add:

- `SkillArtifactGenerator`
- `MarkdownSkillArtifactGenerator`

### infrastructure/publisher
Add:

- `SkillPublisher`
- `HermesLocalSkillPublisher`

### infrastructure/template
Add template rendering helpers or template assets used by the generator.

### infrastructure/gatewayimpl
Extend existing gateway implementations and add the new publish record gateway implementation.

## 15. Runtime call chain

Recommended publish call path:

`AgentDefinitionFeign.publish -> AgentDefinitionController -> AgentDefinitionPublishCmdExecutor -> AgentPublishAppService`

Inside `AgentPublishAppService`:

1. load definition
2. validate publish eligibility
3. create running publish trace
4. generate artifact
5. write repository-local files
6. publish runtime Hermes files
7. upsert `SkillRegistry`
8. upsert `AgentRegistry`
9. create `AgentPublishRecord`
10. update `AgentDefinition` publish status and publish metadata
11. complete trace with success or failure

This is intentionally an application service orchestration, not a single aggregate domain method.

## 16. Testing strategy

Per repository guidance, tests should stay lightweight and avoid `@SpringBootTest` unless absolutely necessary. This phase should rely on direct instantiation and test doubles.

## 16.1 Generator tests

Validate:

- deterministic `AgentDefinition -> SKILL.md` rendering
- required field handling
- invalid payload handling

## 16.2 Publisher tests

Validate:

- successful file writes
- overwrite/update behavior for repeat publish
- invalid path or permissions failure behavior

## 16.3 Application service tests

Using stub gateways and stub publishers, validate:

- happy path publish
- render failure
- Hermes publish failure
- registry persistence failure
- retry semantics

## 16.4 Executor tests

Validate request mapping, basic orchestration delegation, and return values.

## 17. Delivery order

Implementation should proceed in this order:

1. extend domain/persistence models
2. add `AgentPublishRecord`
3. add missing `AgentDefinition` commands/queries/APIs
4. implement artifact generation
5. implement Hermes local publisher
6. implement `AgentPublishAppService`
7. wire `SkillRegistry`/`AgentRegistry` upsert on publish
8. wire `AgentTrace` publish tracing
9. add tests

This order reduces integration ambiguity and keeps the first demonstrable closed loop small.

## 18. Risks and mitigations

### Risk: status model inconsistency
Current code mixes hard-coded `ACTIVE` values and passthrough status assignment.

Mitigation:

- standardize explicit status and publish-status rules during implementation
- centralize transition logic in application/domain methods instead of ad hoc executor behavior

### Risk: artifact and DB drift
Files and DB rows may become inconsistent if publish succeeds partially.

Mitigation:

- treat publish as incomplete until Hermes files are written
- record failure explicitly
- keep retry as first-class behavior

### Risk: overloading AgentTrace
If publish facts and trace facts are mixed without boundaries, later audit becomes confusing.

Mitigation:

- introduce `AgentPublishRecord` now
- keep trace for process lifecycle, publish record for release fact

### Risk: scope creep into runtime platform work
Gateway, webhook, cron, and OTel work could expand this phase too far.

Mitigation:

- keep them as extension points only
- limit the implementation target to one local Hermes publish loop

## 19. Success criteria

This phase is successful when all of the following are true:

1. an `AgentDefinition` can be created and updated as a real source object
2. a publish command generates deterministic `SKILL.md`
3. the generated skill is copied into Hermes local runtime directory
4. `SkillRegistry` is updated to reflect the published skill artifact
5. `AgentRegistry` is updated to reflect the current runtime Agent mapping
6. a distinct `AgentPublishRecord` is written for the publish attempt
7. a `PUBLISH` trace is written with success/failure outcome
8. a failed publish can be retried without overwriting history
9. lightweight automated tests cover the critical publish path

## 20. Future-compatible extension points

This design intentionally leaves clean extension seams for later work:

- `SkillPublisher` for remote or multi-environment publication
- `AgentIdentity` for Gateway enforcement and authorization
- `AgentTrace` for OpenTelemetry and runtime execution observability
- `AgentRegistry.endpointType` for non-Hermes runtime integrations
- `SkillRegistry.source` for local vs hub vs MCP skill resolution

These are extension points, not current implementation obligations.

## 21. Decision summary

The first Layer 3 delivery should be:

**a strengthened Agent metadata kernel with one minimal but real publish loop from AgentDefinition to Hermes local skills**

That provides the smallest useful business closure while preserving architectural discipline and creating a stable base for later Studio, runtime security, scheduling, and observability work.
