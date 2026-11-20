/**
 * service/vector/summary-vector-recall-cache.ts — 最近一次交火向量初筛结果缓存
 *
 * 供交火运行时写入初筛命中的编码列表（AMxxxx），并由剧情推进上下文构建阶段
 * 按用户独立选择的投影列渲染注入给推进 AI，避免把完整正文写回世界书常驻条目。
 */

import { normalizeSummaryVectorIsolationKey_ACU } from '../../shared/summary-vector-index-scope';

export interface SummaryVectorRecallSnapshot_ACU {
    chatKey: string;
    isolationKey: string;
    indexCodes: string[];
    rowKeys: string[];
    updatedAt: number;
}

export interface SummaryVectorRecallDiagnosticItem_ACU {
    indexCode: string;
    rowKey: string;
    kind: 'ranked';
    summaryPreview: string;
    matchedChunkText?: string;
    denseScore?: number;
    bm25Score?: number;
    rrfScore?: number;
    rerankScore?: number;
    score?: number;
}

export interface SummaryVectorRecallDiagnostics_ACU {
    chatKey: string;
    isolationKey: string;
    source: string;
    dryRun: boolean;
    success: boolean;
    skipped: boolean;
    reason?: string;
    userInput: string;
    queryMode: 'keyword_ai' | 'direct';
    queryText: string;
    keywords: string[];
    denseCandidateCount: number;
    sparseCandidateCount: number;
    fusionCandidateCount: number;
    rerankStatus: 'applied' | 'skipped' | 'failed';
    rerankError?: string;
    recentExcludedCount: number;
    rankedCount: number;
    totalSelectedCount: number;
    durationMs: number;
    updatedAt: number;
    items: SummaryVectorRecallDiagnosticItem_ACU[];
}

let latestRecallSnapshot_ACU: SummaryVectorRecallSnapshot_ACU | null = null;
let latestRecallDiagnostics_ACU: SummaryVectorRecallDiagnostics_ACU | null = null;

function normalizeRecallChatKey_ACU(chatKey: unknown): string {
    return String(chatKey ?? '').trim() || 'current-chat';
}

export function setLatestSummaryVectorRecallDiagnostics_ACU(
    diagnostics: SummaryVectorRecallDiagnostics_ACU | null,
): void {
    if (!diagnostics) {
        latestRecallDiagnostics_ACU = null;
        return;
    }
    latestRecallDiagnostics_ACU = {
        ...diagnostics,
        chatKey: normalizeRecallChatKey_ACU(diagnostics.chatKey),
        isolationKey: normalizeSummaryVectorIsolationKey_ACU(diagnostics.isolationKey),
        keywords: Array.isArray(diagnostics.keywords) ? [...diagnostics.keywords] : [],
        items: Array.isArray(diagnostics.items) ? diagnostics.items.map((item) => ({ ...item })) : [],
    };
}

export function getLatestSummaryVectorRecallDiagnostics_ACU(
    chatKey?: string,
    isolationKey?: string,
): SummaryVectorRecallDiagnostics_ACU | null {
    if (!latestRecallDiagnostics_ACU) return null;
    if (chatKey !== undefined && latestRecallDiagnostics_ACU.chatKey !== normalizeRecallChatKey_ACU(chatKey)) {
        return null;
    }
    if (isolationKey !== undefined && latestRecallDiagnostics_ACU.isolationKey !== normalizeSummaryVectorIsolationKey_ACU(isolationKey)) {
        return null;
    }
    return latestRecallDiagnostics_ACU;
}

export function clearLatestSummaryVectorRecallDiagnostics_ACU(): void {
    latestRecallDiagnostics_ACU = null;
}

export function setLatestSummaryVectorRecallSnapshot_ACU(
    snapshot: SummaryVectorRecallSnapshot_ACU | null,
): void {
    if (!snapshot) {
        latestRecallSnapshot_ACU = null;
        return;
    }
    latestRecallSnapshot_ACU = {
        chatKey: normalizeRecallChatKey_ACU(snapshot.chatKey),
        isolationKey: normalizeSummaryVectorIsolationKey_ACU(snapshot.isolationKey),
        indexCodes: Array.isArray(snapshot.indexCodes)
            ? snapshot.indexCodes.map((code) => String(code || '').trim()).filter(Boolean)
            : [],
        rowKeys: Array.isArray(snapshot.rowKeys)
            ? snapshot.rowKeys.map((key) => String(key || '').trim()).filter(Boolean)
            : [],
        updatedAt: Number.isFinite(snapshot.updatedAt) ? snapshot.updatedAt : Date.now(),
    };
}

export function getLatestSummaryVectorRecallSnapshot_ACU(
    chatKey?: string,
    isolationKey?: string,
): SummaryVectorRecallSnapshot_ACU | null {
    if (!latestRecallSnapshot_ACU) return null;
    if (chatKey !== undefined && latestRecallSnapshot_ACU.chatKey !== normalizeRecallChatKey_ACU(chatKey)) {
        return null;
    }
    if (isolationKey !== undefined && latestRecallSnapshot_ACU.isolationKey !== normalizeSummaryVectorIsolationKey_ACU(isolationKey)) {
        return null;
    }
    return latestRecallSnapshot_ACU;
}

export function clearLatestSummaryVectorRecallSnapshot_ACU(): void {
    latestRecallSnapshot_ACU = null;
}
