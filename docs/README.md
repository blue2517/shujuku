# 神·数据库（shujuku）文档索引

本项目所有文档按照使用场景与受众分为四个核心模块：

---

## 1. 📘 用户与创作者指南 (`docs/user-guides/`)

面向表格配置者、提示词创作者及使用 AI 改表助手的用户：

- **[语法全量参考手册](user-guides/syntax-reference.md)**：涵盖 `<random>`、`<calc>`、`<if seed>`、`<if cell>`、`<if cond>`、SQLite ORM 链式调用 `{[db...]}`、原生 SQL `{[sql...]}`、变量命名 `$v:` 等全部模板变量与条件表达式规范。
- **[自定义表建表指南](user-guides/custom-table-guide.md)**：包含原生 DSL / 剧情模式 / SQLite 模式三条路径的关键契约、推荐实践、最小可用示例与排雷指南。
- **[飞行模式使用说明](user-guides/airplane-mode.md)**：会话级大总结与纪要隐藏投影机制、启用/停用不可逆行为说明及保全边界。

---

## 2. 🏛️ 架构与存储协议 (`docs/architecture/`)

面向底层开发、存储层改造与状态恢复研发：

- **[SQLite 运行时数据库设计](architecture/sqlite-runtime-db-design.md)**：内存数据库引擎、Schema 映射、DDL 契约与 Fallback 机制。
- **[运行时 DB 与热路径 WAL](architecture/runtime-db-wal-restore.md)**：运行时 DB 权威状态原则、AI SQL 填表热路径与顺序日志追加。
- **[表格持久层 V2 规范](architecture/table-storage-v2-spec.md)**：全量 Checkpoint + 顺序日志（Mutation Log）协议定义与双协议兼容。
- **[写入并发与事务锁设计](architecture/write-concurrency-locks.md)**：多粒度事务锁、私有 workingData、隔离提交锁与冲突检测。
- **[V2 存储提交约束](architecture/v2-commit-constraints.md)**：`operations` 生成规则、`checkpoint` 语义与调度状态保全。
- **[旧聊天 V2 自动迁移规范](architecture/v2-legacy-migration.md)**：Legacy/V1 数据向 V2 升级流程、混合状态审计与修复。
- **[快照导入导出与恢复规范](architecture/checkpoint-import-export.md)**：`acu-table-checkpoint` 文件格式、隔离作用域与双向迁移。

---

## 3. 🛠️ 开发者与构建发布 (`docs/developer/`)

面向第三方插件集成、外部 API 调用及工程发布运维：

- **[外部 API 调用文档](developer/api-documentation.md)**：`window.AutoCardUpdaterAPI` 暴露的方法定义（预设、数据、表格、世界书等）。
- **[Extension 构建与发布说明](developer/extension-build-release.md)**：从源码到 `dist/extension` 打包及发布直装仓库的完整发布链。

---

## 4. 📚 外部参考资料 (`docs/references/`)

收集整理的 SillyTavern 宿主平台与插件开发规范：

- **[STscript 语言参考](references/STscript语言参考.md)**：SillyTavern 斜杠脚本、闭包、管道与宏语法规范。
- **[酒馆指令与 API 参考](references/酒馆指令.md)**：常用斜杠指令速查表与内置 TypeScript 辅助 API 声明。
- **[插件开发指南](references/插件开发指南.md)**：酒馆顶部栏图标与抽屉式插件集成标准教程。
