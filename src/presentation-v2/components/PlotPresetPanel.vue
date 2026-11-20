<template>
  <AcuPanel
    :title="plotCopy.panels.preset.title"
    :description="plotCopy.panels.preset.description"
  >
    <template #actions>
      <AcuBadge v-if="!store.hasPresets" variant="neutral"
        >使用默认预设</AcuBadge
      >
    </template>

    <AcuText
      variant="status-line"
      class="acu-plot-preset-panel__status-line acu-v2-plot-page__status-line"
    >
      当前聊天:
      <strong class="acu-text__value">{{
        store.activePresetName || "默认预设"
      }}</strong>
      <template v-if="store.defaultPresetName">
        · 全局默认:
        <strong class="acu-text__value">{{
          store.defaultPresetName
        }}</strong></template
      >
      <template v-else>
        · 全局默认: <strong class="acu-text__value">默认预设</strong></template
      >
      <AcuBadge :variant="store.isChatOverridden ? 'accent' : 'neutral'">
        {{ store.isChatOverridden ? "已覆盖" : "跟随全局" }}
      </AcuBadge>
    </AcuText>

    <div class="acu-plot-preset-panel__select-row">
      <AcuPresetDropdown
        :items="presetDropdownItems"
        :model-value="store.activePresetName"
        :default-name="store.defaultPresetName"
        @update:model-value="store.setActivePresetForCurrentChat($event)"
        @set-default="store.setDefaultPreset($event)"
      />
      <AcuIconButton
        v-if="showEdit"
        icon="fa-solid fa-pen"
        :title="store.activePreset ? '编辑当前预设' : '从默认新建预设'"
        @click="management.openEditCurrent"
      />
      <AcuFileButton
        icon-only
        title="导入预设 JSON"
        accept="application/json,.json"
        @file="onImportFile"
      >
        <i class="fa-solid fa-download"></i>
      </AcuFileButton>
      <AcuIconButton
        icon="fa-solid fa-gear"
        title="管理预设"
        @click="management.openManage"
      />
    </div>

    <AcuFormRow
      v-if="showApiPreset"
      label="剧情推进 API 预设"
      hint="默认使用当前的API，选择后仅影响剧情推进功能。"
    >
      <AcuSelect
        :options="pageApiSelectOptions"
        :model-value="store.pageApiPresetName"
        :placeholder="followActiveApiLabel"
        @update:model-value="store.setPageApiPreset($event)"
      />
    </AcuFormRow>

    <div v-if="showContextSettings" class="acu-plot-preset-panel__context-grid">
      <AcuFormRow
        label="AI 上下文"
        hint="仅统计 AI 最新 N 个楼层回复，不统计用户输入。"
      >
        <AcuInput
          :model-value="store.contextTurnCount"
          type="number"
          :min="0"
          :max="20"
          :step="1"
          data-acu-plot-field="contextTurnCount"
          @change="store.setContextTurnCount($event)"
        />
      </AcuFormRow>
      <AcuFormRow
        label="世界书扫描深度"
        hint="扫描世界书关键词时回看的历史消息数（本轮输入另行附加；设 1 = 上次 AI 回复 + 本轮输入，设 0 = 仅本轮输入）。"
      >
        <AcuInput
          :model-value="store.worldbookScanDepth"
          type="number"
          :min="0"
          :max="20"
          :step="1"
          data-acu-plot-field="worldbookScanDepth"
          @change="store.setWorldbookScanDepth($event)"
        />
      </AcuFormRow>
      <AcuFormRow
        class="acu-plot-preset-panel__context-full"
        label="固定排除（排除最新 N 条）"
        hint="最新的 N 条纪要直接排除，不参与检索也不注入（近期正文已在上下文中，如设 5）；无论是否开启交火模式或触发向量召回，发给推进 AI 的纪要与本地直出均会排除最新 N 条；填 0 表示不排除。"
      >
        <AcuInput
          :model-value="recentExclude.recentFixedExcludeCount.value"
          type="number"
          :min="0"
          :step="1"
          data-acu-plot-field="recentFixedExcludeCount"
          @update:model-value="recentExclude.preview($event)"
          @change="recentExclude.commit($event)"
        />
      </AcuFormRow>
    </div>

    <PlotPresetDrawer
      :is-open="management.isDrawerOpen.value"
      :view="management.drawerView.value"
      :title="management.title.value"
      :error="management.error.value"
      :draft-meta="management.draftMeta"
      :context-rules="management.contextRules"
      :preset-meta="management.presetMeta.value"
      :default-preset-name="store.defaultPresetName"
      :api-preset-options="apiPresetOptions"
      :task-editing="management.taskEditing"
      :current-task-api-override="currentTaskApiOverride"
      :show-advanced-rates="devOptions.plotAdvanced.value"
      :rates="management.draftRates"
      :direct-recall-when-below-threshold="management.directRecallWhenBelowThreshold.value"
      :before-close="() => management.confirmIfDirty()"
      @close="management.closeDrawer"
      @back="management.backToManage"
      @open-create="management.openCreate"
      @open-edit="management.openEdit($event)"
      @set-default="store.setDefaultPreset($event)"
      @delete="onDelete"
      @export="onExport"
      @save="management.saveDraft"
      @update-name="management.draftMeta.name = $event"
      @update-context-extract-rules="management.setContextExtractRules"
      @update-context-exclude-rules="management.setContextExcludeRules"
      @update-task-api-override="onTaskApiOverride"
      @update-rate="management.setDraftRate"
      @update-direct-recall="management.setDirectRecall"
    />
  </AcuPanel>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { useChatChangedTick } from "../composables/useChatChangedListener";
import { useDevOptions } from "../composables/useDevOptions";
import { useApiPresetSelectOptions } from "../composables/useApiPresetSelectOptions";
import { usePlotPresetManagement } from "../composables/usePlotPresetManagement";
import { useRecentFixedExcludeConfig } from "../composables/useRecentFixedExcludeConfig";
import { useUiCloseGuard } from "../composables/useUiCloseGuard";
import { plotCopy } from "../copy/plot-copy";
import { useDialogStore } from "../stores/dialog-store";
import { usePlotPresetStore } from "../stores/plot-preset-store";
import { useToastStore } from "../stores/toast-store";
import AcuBadge from "./_lib/AcuBadge.vue";
import AcuFileButton from "./_lib/AcuFileButton.vue";
import AcuFormRow from "./_lib/AcuFormRow.vue";
import AcuIconButton from "./_lib/AcuIconButton.vue";
import AcuInput from "./_lib/AcuInput.vue";
import AcuPanel from "./_lib/AcuPanel.vue";
import type { PresetDropdownItem } from "./_lib/AcuPresetDropdown.vue";
import AcuPresetDropdown from "./_lib/AcuPresetDropdown.vue";
import AcuSelect from "./_lib/AcuSelect.vue";
import AcuText from "./_lib/AcuText.vue";
import PlotPresetDrawer from "./PlotPresetDrawer.vue";

const props = withDefaults(
  defineProps<{
    showEdit?: boolean;
    showApiPreset?: boolean;
    showContextSettings?: boolean;
  }>(),
  {
    showEdit: true,
    showApiPreset: true,
    showContextSettings: false,
  },
);

const store = usePlotPresetStore();
const dialogStore = useDialogStore();
const toast = useToastStore();
const {
  apiStore,
  followActiveApiLabel,
  apiPresetSelectOptions: pageApiSelectOptions,
} = useApiPresetSelectOptions();
const management = usePlotPresetManagement();
const recentExclude = useRecentFixedExcludeConfig();
const devOptions = useDevOptions();

const presetDropdownItems = computed<PresetDropdownItem[]>(() => [
  {
    value: "",
    label: "默认预设",
    meta: `${store.defaultPresetTaskCount} 个任务`,
  },
  ...store.presets.map((p) => ({
    value: p.name,
    label: p.name,
    meta: `${Array.isArray(p.raw?.plotTasks) ? p.raw.plotTasks.length : 0} 个任务`,
  })),
]);

const apiPresetOptions = computed(() =>
  apiStore.presets.map((p) => ({ name: p.name })),
);
const currentTaskApiOverride = computed<string>(() => {
  const taskId = management.taskEditing.currentTaskId.value;
  if (!taskId) return "";
  return store.taskApiOverrides[taskId] || "";
});

useUiCloseGuard(() => {
  if (!management.isDrawerOpen.value) return true;
  return management.confirmIfDirty();
});

function onTaskApiOverride(value: string): void {
  const taskId = management.taskEditing.currentTaskId.value;
  if (!taskId) return;
  store.setTaskApiOverride(taskId, value);
}

async function onDelete(name: string): Promise<void> {
  const confirmed = await dialogStore.confirm({
    title: "删除剧情推进预设",
    message: `删除剧情推进预设"${name}"？`,
    confirmLabel: "删除预设",
    confirmVariant: "danger",
  });
  if (!confirmed) return;
  management.deletePreset(name);
}

function onExport(name: string): void {
  const text = management.exportPresetAsText(name);
  if (!text) return;
  try {
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.plot-preset.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("剧情推进预设 JSON 已导出。");
  } catch {
    toast.error("剧情推进预设 JSON 导出失败。");
  }
}

async function onImportFile(file: File): Promise<void> {
  try {
    const text = await file.text();
    management.importFromJsonText(text);
  } catch {
    /* ignore */
  }
}

function refreshAll(): void {
  store.refreshFromSettings();
  apiStore.refreshFromSettings();
  if (props.showContextSettings) {
    recentExclude.refresh();
  }
}

onMounted(refreshAll);
watch(useChatChangedTick(), refreshAll);
</script>

<style scoped>
.acu-plot-preset-panel__status-line {
  margin: 0 0 10px;
  font-size: var(--acu-font-size-body, 12px);
  line-height: var(--acu-line-height-body, 1.45);
}

.acu-plot-preset-panel__select-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) repeat(3, max-content);
  gap: 6px;
  align-items: stretch;
  margin-bottom: 12px;
  min-width: 0;
}

.acu-plot-preset-panel__context-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.acu-plot-preset-panel__context-full {
  grid-column: 1 / -1;
}

@media (max-width: 640px) {
  .acu-plot-preset-panel__context-grid {
    grid-template-columns: 1fr;
  }
}
</style>
