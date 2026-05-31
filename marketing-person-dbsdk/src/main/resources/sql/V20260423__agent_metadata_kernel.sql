-- Agent metadata kernel phase 1 schema sketch.
-- Apply according to your database migration process.

alter table agent_definition
    add column version varchar(64) null,
    add column publish_status varchar(64) null,
    add column last_publish_at datetime null,
    add column last_publish_by bigint null;

alter table agent_registry
    add column definition_id bigint null,
    add column definition_version varchar(64) null,
    add column identity_id bigint null,
    add column current_skill_id varchar(255) null,
    add column endpoint_type varchar(64) null;

alter table skill_registry
    add column artifact_path varchar(1024) null,
    add column artifact_checksum varchar(128) null,
    add column schema_version varchar(64) null;

alter table agent_trace
    add column trace_type varchar(64) null,
    add column trace_status varchar(64) null,
    add column definition_id bigint null,
    add column registry_id bigint null,
    add column publish_record_id bigint null,
    add column start_at datetime null,
    add column end_at datetime null;

create table if not exists agent_publish_record (
    id bigint primary key auto_increment,
    is_deleted tinyint default 0,
    nezha_tenant_code varchar(128) null,
    definition_id bigint not null,
    definition_version varchar(64) null,
    skill_id varchar(255) not null,
    artifact_path varchar(1024) null,
    artifact_checksum varchar(128) null,
    publisher_type varchar(64) null,
    publish_status varchar(64) null,
    error_msg varchar(2000) null,
    create_at datetime null,
    create_by bigint null,
    create_name varchar(255) null,
    update_at datetime null,
    update_by bigint null,
    update_name varchar(255) null
);
