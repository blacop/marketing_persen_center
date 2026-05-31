PROJECT_DIR := $(shell pwd)
JAR         := marketing-person-infrastructure/target/marketing-person-infrastructure-*.jar
HERMES_SKILLS := cola-generator,arch-reviewer,style-checker

.PHONY: dev build stop clean hermes-status hermes-setup

## 本地开发：启动 Spring Boot + Hermes（需要 tmux）
dev: build
	@echo ">>> Starting Hermes agent session..."
	@tmux new-session -d -s hermes-beukay \
		"cd $(PROJECT_DIR) && hermes --skills $(HERMES_SKILLS) chat" 2>/dev/null || \
		echo "[INFO] hermes-beukay tmux session already running"
	@echo ">>> Starting Spring Boot on port 30000..."
	@java $(JAVA_OPTS) -jar $(JAR)

## 仅构建 JAR（跳过测试）
build:
	mvn clean package -DskipTests

## 停止 Hermes tmux session
stop:
	@tmux kill-session -t hermes-beukay 2>/dev/null || true
	@echo ">>> Hermes session stopped"

## 查看 Hermes 状态
hermes-status:
	@hermes status
	@echo "---"
	@tmux ls 2>/dev/null | grep hermes || echo "No hermes tmux session"

## 新成员初始化：同步 Hermes skill 到本地
hermes-setup:
	@bash hermes/setup.sh

## 清理构建产物
clean:
	mvn clean
