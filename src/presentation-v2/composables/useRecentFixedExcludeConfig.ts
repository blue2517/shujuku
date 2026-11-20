/**
 * useRecentFixedExcludeConfig — 剧情推进/向量召回共用的「固定排除最新 N 条」配置读写。
 *
 * 权威字段保存在 globalMeta_ACU.vectorMemoryConfigGlobal.recentFixedExcludeCount，
 * 无论交火模式是否开启都对剧情推进（$5 与本地直出）生效，交火启用时也同步用于召回前排除。
 */
import { ref } from 'vue';
import {
  getCurrentVectorMemoryConfig_ACU,
  updateGlobalVectorMemoryConfigFields_ACU,
} from '../../service/vector/vector-memory-config';
import { defaultVectorMemoryConfig_ACU } from '../../shared/defaults';
import { useToastStore } from '../stores/toast-store';

export function getDefaultRecentFixedExcludeCount(): number {
  const value = Number((defaultVectorMemoryConfig_ACU as any).recentFixedExcludeCount);
  return Number.isFinite(value) && value >= 0 ? Math.floor(value) : 5;
}

export function useRecentFixedExcludeConfig() {
  const toast = useToastStore();
  const recentFixedExcludeCount = ref<number>(getDefaultRecentFixedExcludeCount());

  function refresh(): void {
    const config = getCurrentVectorMemoryConfig_ACU() as any;
    const raw = Number(config?.recentFixedExcludeCount);
    recentFixedExcludeCount.value = Number.isFinite(raw) && raw >= 0
      ? Math.floor(raw)
      : getDefaultRecentFixedExcludeCount();
  }

  function preview(raw: number | string): void {
    const value = Number(raw);
    recentFixedExcludeCount.value = Number.isFinite(value) ? Math.floor(value) : 0;
  }

  function commit(raw: number | string): void {
    const trimmed = typeof raw === 'string' ? raw.trim() : raw;
    const parsed = trimmed === '' ? Number.NaN : Number(trimmed);
    if (!Number.isFinite(parsed) || parsed < 0) {
      const fallback = getDefaultRecentFixedExcludeCount();
      recentFixedExcludeCount.value = Number.isFinite(parsed) ? Math.floor(parsed) : 0;
      toast.warning(`固定排除必须是非负整数，已重置为默认值 ${fallback}。`);
      recentFixedExcludeCount.value = fallback;
      const result = updateGlobalVectorMemoryConfigFields_ACU({
        recentFixedExcludeCount: fallback,
      });
      if (!result.ok) {
        toast.error(result.message || '保存失败。');
      }
      return;
    }

    const num = Math.floor(parsed);
    recentFixedExcludeCount.value = num;
    const result = updateGlobalVectorMemoryConfigFields_ACU({
      recentFixedExcludeCount: num,
    });
    if (!result.ok) {
      toast.error(result.message || '保存失败。');
    }
  }

  return {
    recentFixedExcludeCount,
    refresh,
    preview,
    commit,
  };
}
