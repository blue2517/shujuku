<template>
  <section class="acu-v2-vector-index-page">
    <AcuMobilePanelNav :items="panelNavItems" />

    <AcuPanelGrid class="acu-v2-vector-index-page__main-grid">
      <div class="acu-v2-vector-index-page__panel-stack">
        <AcuPanel
          id="vector-index-status-panel"
          :title="vectorIndexCopy.panels.status.title"
          :description="vectorIndexCopy.panels.status.description"
        >
          <template #actions>
            <AcuBadge :variant="vector.statusVariant.value">{{
              vector.statusLabel.value
            }}</AcuBadge>
          </template>

          <AcuStatsList :items="vector.statusStatsItems.value" />

          <p class="acu-v2-vector-index-page__hint">
            流程：先按「被向量化的列」建库并初筛出编码 → 再按「推进 AI 注入列」只把命中编码的这些列喂给剧情推进 AI（主模型世界书不被长正文污染）。
          </p>

          <div class="acu-v2-vector-index-page__subconfig">
            <AcuFormRow
              label="被向量化的列（按哪些列搜）"
              hint="决定用纪要表哪几列来算向量和相似度。比如勾选「概览 + 纪要」可提高检索命中率；不选则只搜概览。改完请点下方重建索引。"
            >
              <div class="acu-v2-vector-index-page__checkbox-group">
                <AcuCheckbox
                  v-for="col in vector.availableSummaryColumns.value"
                  :key="`vec-${col}`"
                  :model-value="vector.form.summaryIndexVectorColumns.includes(col)"
                  :label="col"
                  @update:model-value="vector.toggleColumnSelection('summaryIndexVectorColumns', col, $event)"
                />
              </div>
            </AcuFormRow>

            <AcuFormRow
              label="推进 AI 注入列（给推进 AI 看哪些列）"
              hint="决定初筛选中编码后，把哪几列喂给剧情推进 AI（自动附带编码索引）。与上面向量化列完全独立；不选则只看旧版简表。"
            >
              <div class="acu-v2-vector-index-page__checkbox-group">
                <AcuCheckbox
                  v-for="col in vector.availableSummaryColumns.value"
                  :key="`plot-${col}`"
                  :model-value="vector.form.summaryIndexPlotInjectColumns.includes(col)"
                  :label="col"
                  @update:model-value="vector.toggleColumnSelection('summaryIndexPlotInjectColumns', col, $event)"
                />
              </div>
            </AcuFormRow>

            <div
              v-if="!devOptions.vectorIndexAdvanced.value"
              class="acu-v2-vector-index-page__number-grid"
            >
              <AcuFormRow
                label="启用向量最少纪要数"
                hint="纪要达到该行数才开启向量初筛（小聊天想立刻测试可设 1～20）。"
              >
                <AcuInput
                  :model-value="vector.form.summaryIndexKeywordMinRows"
                  type="number"
                  :min="1"
                  :step="1"
                  @change="vector.setNumberField('summaryIndexKeywordMinRows', $event)"
                />
              </AcuFormRow>
              <AcuFormRow
                label="向量最多召回条数（TopK）"
                hint="从排除近期后的更早历史里最多捞几条。"
              >
                <AcuInput
                  :model-value="vector.form.topK"
                  type="number"
                  :min="1"
                  :step="1"
                  @change="vector.setNumberField('topK', $event)"
                />
              </AcuFormRow>
            </div>
          </div>

          <div
            class="acu-v2-vector-index-page__maintenance-spacer"
            aria-hidden="true"
          ></div>

          <div class="acu-v2-vector-index-page__actions">
            <AcuButton
              variant="primary"
              :disabled="vector.buildBusy.value || vector.maintenanceBusy.value"
              @click="vector.buildNow"
            >
              <i class="fa-solid fa-brain"></i>
              {{
                vector.buildBusy.value ? "正在重建..." : "立即构建交火纪要索引"
              }}
            </AcuButton>
            <AcuButton v-if="SHOW_LEGACY_VECTOR_MAINTENANCE_UI"
              :disabled="vector.maintenanceBusy.value || vector.buildBusy.value"
              @click="vector.migrateLegacyIndex"
            >
              非破坏迁移旧索引
            </AcuButton>
            <AcuButton
              :disabled="vector.maintenanceBusy.value || vector.buildBusy.value"
              @click="vector.clearIndexCache"
            >
              清空临时缓存
            </AcuButton>
            <AcuButton
              variant="danger"
              :disabled="vector.maintenanceBusy.value || vector.buildBusy.value"
              @click="onDeleteCurrentIndex"
            >
              删除当前索引
            </AcuButton>
          </div>
        </AcuPanel>

        <AcuPanel
          id="vector-index-keyword-panel"
          :title="vectorIndexCopy.panels.keyword.title"
          :description="vectorIndexCopy.panels.keyword.description"
        >
          <div class="acu-v2-vector-index-page__subconfig">
            <div class="acu-v2-vector-index-page__section-title">标签清洗与字数截取（构造检索文本前生效）</div>
            <AcuFormRow
              label="标签清洗（剥离指定标签及内部内容）"
              hint="填写要剔除的标签名（多个用逗号或换行分隔，如：标签触发, summary, thinking, options）。会在检索前把 <标签触发>...</标签触发> 整段移除。"
            >
              <textarea
                :value="vector.form.queryStripTags"
                class="acu-v2-vector-api-form__instruction-textarea"
                rows="2"
                placeholder="例如：标签触发, summary, thinking, options"
                @change="vector.setApiField('queryStripTags', ($event.target as HTMLTextAreaElement).value)"
              ></textarea>
            </AcuFormRow>
            <AcuFormRow
              label="最新 AI 回复末尾截取字数（完整句子）"
              hint="关闭下方「关键词 AI 生成」时生效：先执行上方标签清洗，再从最新 AI 回复末尾往前截取完整句子（绝不截断半句），与用户本轮输入拼在一起做向量检索。"
            >
              <AcuInput
                :model-value="vector.form.queryTailCharLimit"
                type="number"
                :min="1"
                :step="50"
                @change="vector.setNumberField('queryTailCharLimit', $event)"
              />
            </AcuFormRow>
          </div>

          <AcuFormRow
            label="启用关键词 AI 生成"
            hint="打开：先让小模型结合上下文提取关键词（慢 1.5~4 秒，适合跳跃指代）；关闭：跳过小模型，直接用上方截取的 AI 回复末尾完整句 + 用户输入搜索（零等待）。"
          >
            <AcuToggle
              :model-value="vector.form.keywordGenerationEnabled"
              label="发送前调用 AI 生成检索关键词"
              @update:model-value="vector.setBooleanField('keywordGenerationEnabled', $event)"
            />
          </AcuFormRow>

          <template v-if="vector.form.keywordGenerationEnabled">
            <AcuFormRow
              label="关键词 API 预设"
              hint="默认使用当前的API，仅用于发送前关键词生成。"
            >
              <AcuSelect
                :options="keywordApiOptions"
                :model-value="vector.form.keywordApiPreset"
                :placeholder="followActiveApiLabel"
                @update:model-value="
                  vector.setApiField('keywordApiPreset', $event)
                "
              />
            </AcuFormRow>
            <div class="acu-v2-vector-index-page__number-grid">
              <AcuFormRow
                label="上下文读取层数"
                hint="关键词生成时读取的最近对话层数；1 层 = 1 条 AI 回复 + 其上方 1 条用户输入。"
              >
                <AcuInput
                  :model-value="vector.form.keywordContextPairCount"
                  type="number"
                  :min="1"
                  :step="1"
                  @change="
                    vector.setNumberField('keywordContextPairCount', $event)
                  "
                />
              </AcuFormRow>
              <AcuFormRow
                label="最大尝试次数"
                hint="关键词生成失败时会回退到用户输入本身参与召回，不阻断原始发送。"
              >
                <AcuInput
                  :model-value="vector.form.keywordGenerationMaxAttempts"
                  type="number"
                  :min="1"
                  :step="1"
                  @change="
                    vector.setNumberField('keywordGenerationMaxAttempts', $event)
                  "
                />
              </AcuFormRow>
            </div>
          </template>
        </AcuPanel>
      </div>

      <div class="acu-v2-vector-index-page__panel-stack">
        <AcuPanel
          id="vector-index-api-panel"
          :title="vectorIndexCopy.panels.api.title"
          :description="vectorIndexCopy.panels.api.description"
        >
          <form
            class="acu-v2-vector-api-form"
            @submit.prevent="saveVectorApiConfig"
          >
            <fieldset class="acu-v2-vector-api-form__section">
              <legend>Embedding</legend>
              <AcuFormRow
                label="URL"
                hint="填写完整 Embeddings 请求地址（通常以 /v1/embeddings 结尾）；点下方「加载模型」时会自动推导 /models 地址。"
              >
                <AcuInput
                  v-model="vectorApiConfig.form.embeddingEndpoint"
                  type="text"
                  placeholder="https://example.com/v1/embeddings"
                />
              </AcuFormRow>
              <AcuFormRow label="模型名">
                <AcuInput
                  v-model="vectorApiConfig.form.embeddingModel"
                  type="text"
                  placeholder="BAAI/bge-m3"
                />
              </AcuFormRow>
              <AcuFormRow label="API 密钥">
                <AcuInput
                  v-model="vectorApiConfig.form.embeddingApiKey"
                  type="password"
                  autocomplete="off"
                />
              </AcuFormRow>
              <div class="acu-v2-vector-api-form__inline-action">
                <AcuButton
                  type="button"
                  :disabled="vectorApiConfig.embeddingModelLoadStatus.value === 'loading'"
                  @click="vectorApiConfig.loadEmbeddingModels"
                >
                  加载模型
                </AcuButton>
                <span
                  v-if="vectorApiConfig.embeddingModelLoadStatus.value === 'loading'"
                  class="acu-v2-vector-api-form__muted"
                >加载中...</span>
                <span
                  v-else-if="vectorApiConfig.embeddingModelLoadStatus.value === 'error'"
                  class="acu-v2-vector-api-form__danger"
                >{{ vectorApiConfig.embeddingModelLoadError.value }}</span>
              </div>
              <AcuFormRow
                v-if="vectorApiConfig.embeddingModels.value.length"
                label="Embedding 模型列表"
              >
                <AcuSelect
                  :options="embeddingModelOptions"
                  :model-value="vectorApiConfig.form.embeddingModel"
                  placeholder="请选择模型"
                  @update:model-value="vectorApiConfig.form.embeddingModel = $event"
                />
              </AcuFormRow>
            </fieldset>

            <fieldset class="acu-v2-vector-api-form__section">
              <legend>Rerank</legend>
              <AcuFormRow
                label="URL"
                hint="填写完整 Rerank 请求地址（通常以 /v1/rerank 结尾，不要只填到 /v1）；点下方「加载模型」时会自动推导 /models 地址。"
              >
                <AcuInput
                  v-model="vectorApiConfig.form.rerankEndpoint"
                  type="text"
                  placeholder="https://example.com/v1/rerank"
                />
              </AcuFormRow>
              <AcuFormRow label="模型名">
                <AcuInput
                  v-model="vectorApiConfig.form.rerankModel"
                  type="text"
                  placeholder="BAAI/bge-reranker-v2-m3"
                />
              </AcuFormRow>
              <AcuFormRow label="API 密钥">
                <AcuInput
                  v-model="vectorApiConfig.form.rerankApiKey"
                  type="password"
                  autocomplete="off"
                />
              </AcuFormRow>
              <div class="acu-v2-vector-api-form__inline-action">
                <AcuButton
                  type="button"
                  :disabled="vectorApiConfig.rerankModelLoadStatus.value === 'loading'"
                  @click="vectorApiConfig.loadRerankModels"
                >
                  加载模型
                </AcuButton>
                <span
                  v-if="vectorApiConfig.rerankModelLoadStatus.value === 'loading'"
                  class="acu-v2-vector-api-form__muted"
                >加载中...</span>
                <span
                  v-else-if="vectorApiConfig.rerankModelLoadStatus.value === 'error'"
                  class="acu-v2-vector-api-form__danger"
                >{{ vectorApiConfig.rerankModelLoadError.value }}</span>
              </div>
              <AcuFormRow
                v-if="vectorApiConfig.rerankModels.value.length"
                label="Rerank 模型列表"
              >
                <AcuSelect
                  :options="rerankModelOptions"
                  :model-value="vectorApiConfig.form.rerankModel"
                  placeholder="请选择模型"
                  @update:model-value="vectorApiConfig.form.rerankModel = $event"
                />
              </AcuFormRow>
              <AcuFormRow
                label="重排指令"
                hint="默认启用；清空后不向 Rerank 服务发送 instruction，可用于兼容不支持该字段的服务。"
              >
                <textarea
                  v-model="vectorApiConfig.form.rerankInstruction"
                  class="acu-v2-vector-api-form__instruction-textarea"
                  rows="3"
                  placeholder="留空则不发送 instruction"
                ></textarea>
              </AcuFormRow>
            </fieldset>

            <AcuMessage v-if="vectorApiConfig.errors.value.length" kind="error">
              <p v-for="error in vectorApiConfig.errors.value" :key="error">
                {{ error }}
              </p>
            </AcuMessage>
            <div class="acu-v2-vector-api-form__actions">
              <AcuButton variant="primary" native-type="submit">保存</AcuButton>
            </div>
          </form>
        </AcuPanel>

        <AcuPanel
          id="vector-index-prompt-panel"
          :title="vectorIndexCopy.panels.prompt.title"
          :description="vectorIndexCopy.panels.prompt.description"
        >
          <template #actions>
            <AcuBadge :variant="promptTemplateBadgeVariant">{{
              promptTemplateBadgeLabel
            }}</AcuBadge>
          </template>

          <AcuMessage v-if="keywordPromptEmpty" kind="warning">
            关键词生成提示词为空，发送前会直接用用户输入参与召回；建议载入默认提示词后保存。
          </AcuMessage>

          <div class="acu-v2-vector-index-page__prompt-actions">
            <AcuButton variant="primary" @click="promptDrawerOpen = true"
              >编辑提示词</AcuButton
            >
          </div>
        </AcuPanel>
      </div>
    </AcuPanelGrid>

    <AcuPanelGrid
      v-if="devOptions.vectorIndexAdvanced.value"
      class="acu-v2-vector-index-page__advanced-grid"
    >
      <AcuPanel
        id="vector-index-recall-panel"
        :title="vectorIndexCopy.panels.recall.title"
        :description="vectorIndexCopy.panels.recall.description"
      >
        <div class="acu-v2-vector-index-page__number-grid">
          <AcuFormRow
            label="触发阈值（启用向量最少纪要数）"
            hint="纪要有效行数 ≥ 该值时才开启向量初筛（小聊天想马上测试可设 1～20）；未达标走普通流程。"
          >
            <AcuInput
              :model-value="vector.form.summaryIndexKeywordMinRows"
              type="number"
              :min="1"
              :step="1"
              @change="
                vector.setNumberField('summaryIndexKeywordMinRows', $event)
              "
            />
          </AcuFormRow>
          <AcuFormRow
            label="TopK（最多召回较早历史条数）"
            hint="从排除近期后的更早历史里经向量与重排后最多捞回几条。"
          >
            <AcuInput
              :model-value="vector.form.topK"
              type="number"
              :min="1"
              :step="1"
              @change="vector.setNumberField('topK', $event)"
            />
          </AcuFormRow>
          <AcuFormRow
            label="预筛最低分（向量相似度门槛）"
            hint="0~1 之间，余弦相似度低于此分的片段直接丢弃不送去重排（常用 0.25~0.45，过高容易捞不到）。"
          >
            <AcuInput
              :model-value="vector.form.minScore"
              type="number"
              :min="0"
              :max="1"
              :step="0.01"
              @change="vector.setMinScore($event)"
            />
          </AcuFormRow>
          <AcuFormRow
            label="候选上限（送去重排片段数）"
            hint="粗排最多送多少个片段给 Rerank 重排，必须 ≥ TopK；云端 Rerank 建议设 80~150，太大易变慢。"
          >
            <AcuInput
              :model-value="vector.form.recallCandidateLimit"
              type="number"
              :min="1"
              :step="1"
              @change="vector.setNumberField('recallCandidateLimit', $event)"
            />
          </AcuFormRow>
          <AcuFormRow
            label="命名空间"
            hint="用于区分不同聊天的索引缓存键前缀，一般保持默认 chat 即可。"
          >
            <AcuInput
              :model-value="vector.form.vectorNamespace"
              type="text"
              placeholder="chat"
              @change="vector.setApiField('vectorNamespace', $event)"
            />
          </AcuFormRow>
        </div>
      </AcuPanel>

      <AcuPanel
        id="vector-index-archive-panel"
        :title="vectorIndexCopy.panels.archive.title"
        :description="vectorIndexCopy.panels.archive.description"
      >
        <div class="acu-v2-vector-index-page__number-grid">
          <AcuFormRow
            label="分块句数"
            hint="纪要概要列每段句数。越小越精细，分片越多。"
          >
            <AcuInput
              :model-value="vector.form.summaryChunkSentenceCount"
              type="number"
              :min="1"
              :step="1"
              @change="
                vector.setNumberField('summaryChunkSentenceCount', $event)
              "
            />
          </AcuFormRow>
          <AcuFormRow label="归档批次" hint="每次处理的行数，影响批量速度。">
            <AcuInput
              :model-value="vector.form.summaryIndexArchiveMaxConcurrency"
              type="number"
              :min="1"
              :step="1"
              @change="
                vector.setNumberField(
                  'summaryIndexArchiveMaxConcurrency',
                  $event,
                )
              "
            />
          </AcuFormRow>
          <AcuFormRow v-if="SHOW_LEGACY_VECTOR_MAINTENANCE_UI"
            label="滚动增量"
            hint="当前因 V2 不可变发布生命周期要求而暂停。即使历史配置已开启，归档仍会安全地写入 V2 单文件快照。"
          >
            <AcuToggle
              :model-value="vector.form.summaryIndexRollingDeltaEnabled"
              label="滚动增量写入暂不可用"
              :disabled="true"
            />
          </AcuFormRow>
          <AcuFormRow v-if="SHOW_LEGACY_VECTOR_MAINTENANCE_UI"
            label="折叠阈值 K"
            hint="仅保留历史配置兼容；滚动增量恢复 V2 安全发布语义前不生效。"
          >
            <AcuInput
              :model-value="vector.form.summaryIndexRollingDeltaFoldThreshold || 15"
              type="number"
              :min="1"
              :step="1"
              disabled
            />
          </AcuFormRow>
        </div>
        <AcuFormRow
          v-if="SHOW_LEGACY_VECTOR_MAINTENANCE_UI"
          label="V2 写入闸门"
          hint="默认开启（新装或未显式配置的用户默认走 V2 归档路径）。关闭只会阻止新的 V2 快照写入；已发布 V2 快照仍可读取，绝不会回退覆盖旧路径。"
        >
          <AcuToggle
            :model-value="vector.form.summaryIndexV2WriteEnabled"
            label="允许 V2 快照写入"
            @update:model-value="vector.setBooleanField('summaryIndexV2WriteEnabled', $event)"
          />
        </AcuFormRow>
        <AcuFormRow
          v-if="SHOW_LEGACY_VECTOR_MAINTENANCE_UI"
          label="V2 写入 scope allowlist"
          hint="每行一个 canonical scope fingerprint。留空表示不额外限制已显式开启的 writer；错误 scope 不会写入。"
        >
          <textarea
            :value="vector.form.summaryIndexV2WriteScopeAllowlistText"
            class="acu-v2-vector-index-page__scope-allowlist"
            rows="4"
            spellcheck="false"
            placeholder="每行一个 scope fingerprint"
            @change="vector.setV2WriteScopeAllowlist(($event.target as HTMLTextAreaElement).value)"
          ></textarea>
        </AcuFormRow>
      </AcuPanel>
    </AcuPanelGrid>

    <AcuPanel
      id="vector-index-diagnostics-panel"
      :title="vectorIndexCopy.panels.diagnostics.title"
      :description="vectorIndexCopy.panels.diagnostics.description"
    >
      <template #actions>
        <AcuBadge v-if="diagData" :variant="diagBadgeVariant">{{ diagBadgeLabel }}</AcuBadge>
      </template>

      <div class="acu-v2-vector-diag__toolbar">
        <AcuInput
          v-model="vector.testUserInput.value"
          type="text"
          placeholder="输入测试台词（留空则自动读取最近一条用户发言，搭配当前 AI 末尾句试跑）"
        />
        <AcuButton
          variant="primary"
          :disabled="vector.testRecallBusy.value || vector.buildBusy.value"
          @click="vector.runRecallDryTest"
        >
          {{ vector.testRecallBusy.value ? "正在试跑..." : "测试召回效果" }}
        </AcuButton>
        <AcuButton
          :disabled="vector.testRecallBusy.value"
          @click="vector.refreshRecallDiagnostics"
        >
          刷新记录
        </AcuButton>
      </div>

      <p v-if="!diagData" class="acu-v2-vector-index-page__hint">
        暂无召回记录。你可以直接点「测试召回效果」试跑一次，或在聊天中发送一条消息后再点「刷新记录」。
      </p>

      <div v-else class="acu-v2-vector-diag__body">
        <div class="acu-v2-vector-diag__meta">
          <span><strong>运行方式：</strong>{{ diagData.dryRun ? "UI 试跑（未写世界书）" : "真实发送前触发" }}</span>
          <span><strong>构造模式：</strong>{{ diagData.queryMode === "direct" ? "直出截取拼接" : "关键词 AI 生成" }}</span>
          <span><strong>耗时：</strong>{{ diagData.durationMs }} ms</span>
          <span>
            <strong>Rerank：</strong>
            {{ diagData.rerankStatus === "applied" ? "已重排" : diagData.rerankStatus === "failed" ? `失败已回退（${diagData.rerankError || "未知错误"}）` : "未配置或已跳过" }}
          </span>
          <span>
            <strong>候选漏斗：</strong>
            固定排除近期 {{ diagData.recentExcludedCount }} 条 → 向量 {{ diagData.denseCandidateCount }} / BM25 {{ diagData.sparseCandidateCount }} / 融合进重排 {{ diagData.fusionCandidateCount }} → 召回注入 {{ diagData.totalSelectedCount }} 条
          </span>
        </div>

        <div v-if="diagData.skipped" class="acu-v2-vector-diag__warn">
          本次未执行召回（reason: {{ diagData.reason || "skipped" }}）
        </div>

        <div v-if="diagData.keywords.length > 0" class="acu-v2-vector-diag__block">
          <div class="acu-v2-vector-index-page__section-title">提取出的关键词（{{ diagData.keywords.length }}）</div>
          <div class="acu-v2-vector-diag__query-box">{{ diagData.keywords.join("，") }}</div>
        </div>

        <div class="acu-v2-vector-diag__block">
          <div class="acu-v2-vector-index-page__section-title">实际送入匹配的检索文本（Query Text）</div>
          <pre class="acu-v2-vector-diag__query-box">{{ diagData.queryText || "（未生成检索文本）" }}</pre>
        </div>

        <div v-if="diagData.items.length > 0" class="acu-v2-vector-diag__block">
          <div class="acu-v2-vector-index-page__section-title">命中编码与匹配分片明细（{{ diagData.items.length }} 条）</div>
          <div class="acu-v2-vector-diag__items">
            <div
              v-for="item in diagData.items"
              :key="`${item.rowKey}-${item.indexCode}`"
              class="acu-v2-vector-diag__item"
            >
              <div class="acu-v2-vector-diag__item-head">
                <AcuBadge variant="accent">{{ item.indexCode }}</AcuBadge>
                <span class="acu-v2-vector-diag__kind">向量/重排命中</span>
                <span class="acu-v2-vector-diag__scores">
                  <template v-if="item.rerankScore !== undefined">Rerank {{ formatDiagScore(item.rerankScore) }} · </template>
                  <template v-if="item.denseScore !== undefined">Embedding {{ formatDiagScore(item.denseScore) }} · </template>
                  <template v-if="item.bm25Score !== undefined">BM25 {{ formatDiagScore(item.bm25Score) }}</template>
                </span>
              </div>
              <div v-if="item.summaryPreview" class="acu-v2-vector-diag__summary">{{ item.summaryPreview }}</div>
              <div v-if="item.matchedChunkText" class="acu-v2-vector-diag__chunk">
                <strong>命中分片：</strong>{{ item.matchedChunkText }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AcuPanel>

    <VectorIndexPromptDrawer
      :is-open="promptDrawerOpen"
      :segments="promptSegmentsForView"
      :dirty="vector.promptDirty.value"
      :message="vector.message.value"
      :role-options="ROLE_OPTIONS"
      @close="promptDrawerOpen = false"
      @save="vector.savePromptGroup"
      @reset="vector.resetPromptGroup"
      @add="vector.addPromptSegment($event)"
      @delete="vector.deletePromptSegment($event)"
      @update="onPromptUpdate"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import AcuBadge, {
  type AcuBadgeVariant,
} from "../components/_lib/AcuBadge.vue";
import AcuButton from "../components/_lib/AcuButton.vue";
import AcuCheckbox from "../components/_lib/AcuCheckbox.vue";
import AcuFormRow from "../components/_lib/AcuFormRow.vue";
import AcuInput from "../components/_lib/AcuInput.vue";
import AcuMessage from "../components/_lib/AcuMessage.vue";
import AcuMobilePanelNav from "../components/_lib/AcuMobilePanelNav.vue";
import AcuPanel from "../components/_lib/AcuPanel.vue";
import AcuPanelGrid from "../components/_lib/AcuPanelGrid.vue";
import type { PromptSegment } from "../components/_lib/AcuPromptSegments.vue";
import AcuSelect, {
  type AcuSelectOption,
} from "../components/_lib/AcuSelect.vue";
import AcuStatsList from "../components/_lib/AcuStatsList.vue";
import AcuToggle from "../components/_lib/AcuToggle.vue";
import VectorIndexPromptDrawer from "../components/VectorIndexPromptDrawer.vue";
import { useApiPresetSelectOptions } from "../composables/useApiPresetSelectOptions";
import { useChatChangedTick } from "../composables/useChatChangedListener";
import { useDevOptions } from "../composables/useDevOptions";
import { useUiCloseGuard } from "../composables/useUiCloseGuard";
import { useVectorApiConfig } from "../composables/useVectorApiConfig";
import { useVectorIndexConfig } from "../composables/useVectorIndexConfig";
import { vectorIndexCopy } from "../copy/vector-index-copy";
import { useDialogStore } from "../stores/dialog-store";

/**
 * 交火索引页遗留维护入口的 UI 显示开关。
 *
 * V2 快照写入已经是默认行为，并由 settings-service 的一次性 marker 处理
 * 旧配置迁移；这里仅停止暴露可关闭 writer、约束 scope 与已停用滚动增量的
 * 页面控件。composable、配置字段和持久化逻辑不受影响，改为 true 即可恢复。
 *
 * 隐藏非破坏迁移按钮会使 legacy 索引不再有页面级主动迁移入口；其读取路径
 * 与保留策略不变。
 */
const SHOW_LEGACY_VECTOR_MAINTENANCE_UI = false;

const dialogStore = useDialogStore();
const vector = useVectorIndexConfig();
const vectorApiConfig = useVectorApiConfig();
const devOptions = useDevOptions();
const {
  apiStore,
  followActiveApiLabel,
  apiPresetSelectOptions: keywordApiOptions,
} = useApiPresetSelectOptions();
const promptDrawerOpen = ref(false);
const panelNavItems = computed(() => [
  { id: "vector-index-status-panel", label: vectorIndexCopy.nav.status },
  { id: "vector-index-keyword-panel", label: vectorIndexCopy.nav.keyword },
  { id: "vector-index-api-panel", label: vectorIndexCopy.nav.api },
  { id: "vector-index-prompt-panel", label: vectorIndexCopy.nav.prompt },
  ...(devOptions.vectorIndexAdvanced.value
    ? [
        { id: "vector-index-recall-panel", label: vectorIndexCopy.nav.recall },
        {
          id: "vector-index-archive-panel",
          label: vectorIndexCopy.nav.archive,
        },
      ]
    : []),
  { id: "vector-index-diagnostics-panel", label: vectorIndexCopy.nav.diagnostics },
]);

const diagData = computed(() => vector.recallDiagnostics.value);
const diagBadgeVariant = computed<AcuBadgeVariant>(() => {
  if (!diagData.value) return "neutral";
  if (diagData.value.rerankStatus === "failed") return "warning";
  if (diagData.value.skipped || !diagData.value.success) return "danger";
  return "success";
});
const diagBadgeLabel = computed(() => {
  if (!diagData.value) return "";
  if (diagData.value.rerankStatus === "failed") return "已回退";
  if (diagData.value.skipped) return "已跳过";
  return diagData.value.dryRun ? "试跑完成" : "已记录";
});

function formatDiagScore(value: number | undefined): string {
  return Number.isFinite(Number(value)) ? Number(value).toFixed(3) : "—";
}

const ROLE_OPTIONS: AcuSelectOption[] = [
  { value: "system", label: "SYSTEM" },
  { value: "user", label: "USER" },
  { value: "assistant", label: "ASSISTANT" },
];

const embeddingModelOptions = computed<AcuSelectOption[]>(() =>
  vectorApiConfig.embeddingModels.value.map((m) => ({ value: m, label: m })),
);
const rerankModelOptions = computed<AcuSelectOption[]>(() =>
  vectorApiConfig.rerankModels.value.map((m) => ({ value: m, label: m })),
);

const promptSegmentsForView = computed<PromptSegment[]>(() =>
  vector.promptSegments.value.map((seg) => ({
    role: seg.role,
    content: seg.content,
    deletable: seg.deletable,
  })),
);
const keywordPromptEmpty = computed(() =>
  vector.promptSegments.value.every((seg) => !String(seg.content || "").trim()),
);
const promptTemplateBadgeLabel = computed(() =>
  vector.promptTemplateMode.value === "default"
    ? "使用默认提示词"
    : "已自定义提示词",
);
const promptTemplateBadgeVariant = computed<AcuBadgeVariant>(() =>
  vector.promptTemplateMode.value === "default" ? "neutral" : "accent",
);

function confirmPromptClose(): boolean | Promise<boolean> {
  if (!promptDrawerOpen.value || !vector.promptDirty.value) return true;
  return dialogStore.confirm({
    title: "关闭新 UI",
    message: "你有未保存的关键词生成提示词修改，确定要关闭新 UI 吗？",
    confirmLabel: "关闭新 UI",
    confirmVariant: "danger",
  });
}

function onPromptUpdate(index: number, patch: Partial<PromptSegment>): void {
  vector.updatePromptSegment(index, {
    ...(patch.role !== undefined ? { role: patch.role } : {}),
    ...(patch.content !== undefined ? { content: patch.content } : {}),
  });
}

function refreshAll(): void {
  vector.refresh();
  vectorApiConfig.refresh();
  void vector.refreshIndexStatus(false);
  apiStore.refreshFromSettings();
}

function saveVectorApiConfig(): void {
  if (vectorApiConfig.save()) vector.refresh();
}

async function onDeleteCurrentIndex(): Promise<void> {
  const confirmed = await dialogStore.confirm({
    title: "删除当前索引",
    message:
      "删除当前聊天的交火索引？这会移除索引引用并清理可回收外置资产，之后需要重新构建。",
    confirmLabel: "删除索引",
    confirmVariant: "danger",
  });
  if (!confirmed)
    return;
  void vector.deleteCurrentIndex();
}

onMounted(() => {
  refreshAll();
});
watch(useChatChangedTick(), () => {
  refreshAll();
});
useUiCloseGuard(confirmPromptClose);
</script>

<style scoped>
.acu-v2-vector-index-page {
  min-height: 100%;
  min-width: 0;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.acu-v2-vector-index-page__panel-stack {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.acu-v2-vector-index-page__number-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.acu-v2-vector-api-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.acu-v2-vector-api-form__section {
  min-width: 0;
  margin: 0;
  padding: 0 0 18px;
  border: 0;
  border-bottom: 1px solid
    color-mix(in srgb, var(--acu-text-3) 16%, transparent);
  border-radius: 0;
  background: transparent;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.acu-v2-vector-api-form__section:last-of-type {
  padding-bottom: 0;
  border-bottom: 0;
}

.acu-v2-vector-api-form__section + .acu-v2-vector-api-form__section {
  padding-top: 2px;
}

.acu-v2-vector-api-form__section legend {
  width: 100%;
  margin: 0 0 2px;
  padding: 0;
  color: var(--acu-text-1);
  font-size: var(--acu-font-size-body, 12px);
  font-weight: 700;
  line-height: 1.35;
}

.acu-v2-vector-api-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 12px;
  margin-top: 4px;
}

.acu-v2-vector-index-page__hint {
  margin: 0;
  font-size: var(--acu-font-size-body, 12px);
  color: var(--acu-text-3);
  line-height: 1.55;
}

.acu-v2-vector-index-page__subconfig {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 8px;
}

.acu-v2-vector-index-page__section-title {
  font-size: var(--acu-font-size-body, 12px);
  font-weight: 700;
  color: var(--acu-text-1);
}

.acu-v2-vector-index-page__checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
}

.acu-v2-vector-api-form__inline-action {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.acu-v2-vector-api-form__muted {
  font-size: var(--acu-font-size-body, 12px);
  color: var(--acu-text-3);
}

.acu-v2-vector-api-form__danger {
  font-size: var(--acu-font-size-body, 12px);
  color: var(--acu-danger, #ef4444);
}

.acu-v2-vector-index-page__maintenance-spacer {
  flex: 1 1 auto;
  min-height: 0;
}

.acu-v2-vector-index-page__actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 12px;
  margin-top: 4px;
}

.acu-v2-vector-index-page__prompt-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 12px;
  margin-top: 4px;
}

@media (max-width: 860px) {
  .acu-v2-vector-index-page {
    padding: 14px;
  }
}

.acu-v2-vector-api-form__instruction-textarea {
  width: 100%;
  min-height: 60px;
  padding: 6px 8px;
  border: 1px solid color-mix(in srgb, var(--acu-text-3) 24%, transparent);
  border-radius: 4px;
  background: var(--acu-bg-2, transparent);
  color: var(--acu-text-1);
  font-size: var(--acu-font-size-body, 12px);
  line-height: 1.5;
  resize: vertical;
}

.acu-v2-vector-index-page__scope-allowlist {
  width: 100%;
  min-height: 72px;
  padding: 6px 8px;
  border: 1px solid color-mix(in srgb, var(--acu-text-3) 24%, transparent);
  border-radius: 4px;
  background: var(--acu-bg-2, transparent);
  color: var(--acu-text-1);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: var(--acu-font-size-small, 11px);
  line-height: 1.5;
  resize: vertical;
}

.acu-v2-vector-diag__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.acu-v2-vector-diag__toolbar > :first-child {
  flex: 1 1 280px;
}

.acu-v2-vector-diag__body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
}

.acu-v2-vector-diag__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
  font-size: var(--acu-font-size-body, 12px);
  color: var(--acu-text-2, var(--acu-text-1));
}

.acu-v2-vector-diag__warn {
  padding: 8px 10px;
  border-radius: 4px;
  border: 1px solid color-mix(in srgb, var(--acu-warning, #f59e0b) 45%, transparent);
  color: var(--acu-warning, #f59e0b);
  font-size: var(--acu-font-size-body, 12px);
}

.acu-v2-vector-diag__block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.acu-v2-vector-diag__query-box {
  margin: 0;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid color-mix(in srgb, var(--acu-text-3) 22%, transparent);
  background: color-mix(in srgb, var(--acu-bg-2, #111) 60%, transparent);
  color: var(--acu-text-1);
  font-size: var(--acu-font-size-body, 12px);
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 220px;
  overflow-y: auto;
}

.acu-v2-vector-diag__items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 360px;
  overflow-y: auto;
}

.acu-v2-vector-diag__item {
  padding: 8px 10px;
  border-radius: 4px;
  border: 1px solid color-mix(in srgb, var(--acu-text-3) 20%, transparent);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.acu-v2-vector-diag__item-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.acu-v2-vector-diag__kind {
  font-size: var(--acu-font-size-small, 11px);
  color: var(--acu-text-3);
}

.acu-v2-vector-diag__scores {
  font-size: var(--acu-font-size-small, 11px);
  color: var(--acu-accent, #6ee7b7);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.acu-v2-vector-diag__summary {
  font-size: var(--acu-font-size-body, 12px);
  color: var(--acu-text-1);
  line-height: 1.45;
}

.acu-v2-vector-diag__chunk {
  font-size: var(--acu-font-size-small, 11px);
  color: var(--acu-text-3);
  line-height: 1.45;
}
</style>
