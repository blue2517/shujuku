import { reactive, ref } from "vue";
import { fetchModelsFromVectorEndpoint_ACU } from "../../service/ai/ai-service";
import { saveSettings_ACU } from "../../service/settings/settings-service";
import {
  getCurrentVectorMemoryConfig_ACU,
  validateSummaryVectorIndexConfig_ACU,
} from "../../service/vector/vector-memory-config";
import { useToastStore } from "../stores/toast-store";

export type VectorModelLoadStatus = "idle" | "loading" | "loaded" | "error";

export interface VectorApiForm {
  embeddingEndpoint: string;
  embeddingModel: string;
  embeddingApiKey: string;
  rerankEndpoint: string;
  rerankModel: string;
  rerankApiKey: string;
  rerankInstruction: string;
}

function createEmptyForm(): VectorApiForm {
  return {
    embeddingEndpoint: "",
    embeddingModel: "",
    embeddingApiKey: "",
    rerankEndpoint: "",
    rerankModel: "",
    rerankApiKey: "",
    rerankInstruction: "",
  };
}

export function useVectorApiConfig() {
  const toast = useToastStore();
  const form = reactive<VectorApiForm>(createEmptyForm());
  const errors = ref<string[]>([]);
  const savedAt = ref<number | null>(null);
  const embeddingModels = ref<string[]>([]);
  const embeddingModelLoadStatus = ref<VectorModelLoadStatus>("idle");
  const embeddingModelLoadError = ref("");
  const rerankModels = ref<string[]>([]);
  const rerankModelLoadStatus = ref<VectorModelLoadStatus>("idle");
  const rerankModelLoadError = ref("");

  function refresh(): void {
    const config = getCurrentVectorMemoryConfig_ACU();
    form.embeddingEndpoint = config.embeddingEndpoint || "";
    form.embeddingModel = config.embeddingModel || "";
    form.embeddingApiKey = config.embeddingApiKey || "";
    form.rerankEndpoint = config.rerankEndpoint || "";
    form.rerankModel = config.rerankModel || "";
    form.rerankApiKey = config.rerankApiKey || "";
    form.rerankInstruction = config.rerankInstruction ?? "";
    errors.value = [];
  }

  async function loadModelsForTarget(target: "embedding" | "rerank"): Promise<boolean> {
    const endpoint = target === "embedding" ? form.embeddingEndpoint : form.rerankEndpoint;
    const apiKey = target === "embedding" ? form.embeddingApiKey : form.rerankApiKey;
    const modelsRef = target === "embedding" ? embeddingModels : rerankModels;
    const statusRef = target === "embedding" ? embeddingModelLoadStatus : rerankModelLoadStatus;
    const errorRef = target === "embedding" ? embeddingModelLoadError : rerankModelLoadError;
    const label = target === "embedding" ? "Embedding" : "Rerank";

    if (!endpoint.trim()) {
      statusRef.value = "error";
      errorRef.value = `请先填写 ${label} URL。`;
      return false;
    }

    statusRef.value = "loading";
    errorRef.value = "";
    try {
      const result = await fetchModelsFromVectorEndpoint_ACU(endpoint, apiKey);
      if (!result.success || !result.models?.length) {
        statusRef.value = "error";
        errorRef.value = result.error || `未能从 ${label} 端点拉取到模型。`;
        return false;
      }
      modelsRef.value = [...result.models];
      statusRef.value = "loaded";
      toast.success(`已拉取 ${result.models.length} 个 ${label} 候选模型。`);
      return true;
    } catch (error: any) {
      statusRef.value = "error";
      errorRef.value = error?.message || `拉取 ${label} 模型失败。`;
      return false;
    }
  }

  function loadEmbeddingModels(): Promise<boolean> {
    return loadModelsForTarget("embedding");
  }

  function loadRerankModels(): Promise<boolean> {
    return loadModelsForTarget("rerank");
  }

  function save(): boolean {
    const config = getCurrentVectorMemoryConfig_ACU();
    config.embeddingEndpoint = form.embeddingEndpoint.trim();
    config.embeddingModel = form.embeddingModel.trim();
    config.embeddingApiKey = form.embeddingApiKey;
    config.rerankEndpoint = form.rerankEndpoint.trim();
    config.rerankModel = form.rerankModel.trim();
    config.rerankApiKey = form.rerankApiKey;
    config.rerankInstruction = form.rerankInstruction.trim();

    const validation = validateSummaryVectorIndexConfig_ACU(config);
    if (!validation.valid) {
      errors.value = formatVectorApiErrors(validation.errors);
      return false;
    }

    errors.value = [];
    saveSettings_ACU();
    savedAt.value = Date.now();
    toast.success("向量服务配置已保存。");
    return true;
  }

  refresh();

  return {
    form,
    errors,
    savedAt,
    embeddingModels,
    embeddingModelLoadStatus,
    embeddingModelLoadError,
    rerankModels,
    rerankModelLoadStatus,
    rerankModelLoadError,
    loadEmbeddingModels,
    loadRerankModels,
    refresh,
    save,
  };
}

function formatVectorApiErrors(rawErrors: string[]): string[] {
  return rawErrors.map((error) => {
    if (error.includes("embeddingEndpoint")) {
      return "缺少“向量化URL”";
    }
    if (error.includes("embeddingModel")) {
      return "缺少“向量化模型名”";
    }
    if (error.includes("rerankEndpoint") || error.includes("rerankModel")) {
      return "“重排URL”和“重排模型名”需要同时填写，或者同时留空";
    }
    return error;
  });
}
