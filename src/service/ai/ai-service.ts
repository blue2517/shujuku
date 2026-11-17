/**
 * service/ai/ai-service.ts — AI 调用服务
 *
 * 中转 data/gateways/ai-gateway 的所有方法。
 * presentation 层通过本模块发起 AI 请求，不再直接调用 gateway。
 * 后续可在此层统一添加日志、埋点、请求限流等增值逻辑。
 */

export {
    isGenerateRawAvailable_ACU,
    isConnectionManagerAvailable_ACU,
    isTriggerSlashAvailable_ACU,
    generateRaw_ACU,
    sendConnectionManagerRequest_ACU,
    triggerSlash_ACU,
    getConnectionManagerProfiles_ACU,
    getHostRequestHeaders_ACU,
} from '../../data/gateways/ai-gateway';

import { getHostRequestHeaders_ACU as _getHeaders } from '../../data/gateways/ai-gateway';
import { logDebug_ACU } from '../../shared/utils';

// ============================================================
// 模型列表获取
// ============================================================

export interface FetchModelsResult {
    success: boolean;
    models?: string[];
    error?: string;
}

/**
 * 从自定义 API 端点获取可用模型列表
 * 纯业务逻辑：发送 HTTP 请求、解析响应、返回模型列表
 * 不涉及 UI（toast、状态显示由 presentation 层负责）
 */
export async function fetchAvailableModels_ACU(apiUrl: string, apiKey: string): Promise<FetchModelsResult> {
    if (!apiUrl) {
        return { success: false, error: '请输入API基础URL。' };
    }

    const statusUrl = `/api/backends/chat-completions/status`;
    const body = {
        "reverse_proxy": apiUrl,
        "proxy_password": "",
        "chat_completion_source": "custom",
        "custom_url": apiUrl,
        "custom_include_headers": apiKey ? `Authorization: Bearer ${apiKey}` : ""
    };

    const response = await fetch(statusUrl, {
        method: 'POST',
        headers: { ..._getHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `API端点状态检查失败: ${response.status} ${response.statusText}.`;
        try {
            const errorJson = JSON.parse(errorText);
            errorMessage += ` 详情: ${errorJson.error || errorJson.message || errorText}`;
        } catch (e) {
            errorMessage += ` 详情: ${errorText}`;
        }
        return { success: false, error: errorMessage };
    }

    const data = await response.json();
    logDebug_ACU('获取到的模型数据:', data);

    let modelsList: any[] = [];
    if (data && data.models && Array.isArray(data.models)) {
        modelsList = data.models;
    } else if (data && data.data && Array.isArray(data.data)) {
        modelsList = data.data;
    } else if (Array.isArray(data)) {
        modelsList = data;
    }

    const modelNames = modelsList
        .map((model: any) => typeof model === 'string' ? model : model.id)
        .filter(Boolean);

    if (modelNames.length === 0) {
        return { success: false, error: '未能解析模型数据或列表为空。' };
    }

    return { success: true, models: modelNames };
}

/**
 * 通过酒馆连接管理器 Profile 拉取该配置可用的模型列表
 * 复用酒馆内部已保存的凭证（secret-id）、反代、自定义端点配置
 */
export async function fetchModelsForProfile_ACU(profileId: string): Promise<FetchModelsResult> {
    if (!profileId || typeof profileId !== 'string') {
        return { success: false, error: '请先选择一个酒馆连接预设。' };
    }

    try {
        const globalScope: any = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);
        const hostWin: any = globalScope?.parent || globalScope;
        const ctx = globalScope?.SillyTavern?.getContext?.() || hostWin?.SillyTavern?.getContext?.();

        const profiles: any[] = ctx?.extensionSettings?.connectionManager?.profiles
            ?? (globalScope as any)?.extension_settings?.connectionManager?.profiles
            ?? hostWin?.extension_settings?.connectionManager?.profiles
            ?? [];

        const profile = profiles.find((p: any) => p && String(p.id) === String(profileId));
        if (!profile) {
            return { success: false, error: '未找到所选酒馆连接预设。' };
        }

        const connectApiMap = ctx?.CONNECT_API_MAP ?? hostWin?.CONNECT_API_MAP;
        const apiMap = connectApiMap?.[profile.api];
        const source = apiMap?.source || (typeof profile.api === 'string' ? profile.api : '');

        if (!source) {
            return { success: false, error: '未能识别该连接预设的 API 类型。' };
        }
        if (apiMap && apiMap.selected !== 'openai') {
            return { success: false, error: '该连接预设类型暂不支持拉取模型列表（仅支持 Chat Completion 类接口）。' };
        }

        const proxies = ctx?.extensionSettings?.connectionManager?.proxies
            ?? (globalScope as any)?.extension_settings?.connectionManager?.proxies
            ?? hostWin?.extension_settings?.connectionManager?.proxies
            ?? [];
        const proxyPreset = Array.isArray(proxies) ? proxies.find((p: any) => p && p.name === profile.proxy) : undefined;

        const body: Record<string, any> = {
            chat_completion_source: source,
            secret_id: profile['secret-id'] || '',
            reverse_proxy: proxyPreset?.url || '',
            proxy_password: proxyPreset?.password || '',
            custom_url: profile['api-url'] || '',
        };

        const response = await fetch('/api/backends/chat-completions/status', {
            method: 'POST',
            headers: { ..._getHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `获取模型列表失败: HTTP ${response.status} ${response.statusText}.`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage += ` 详情: ${errorJson.error || errorJson.message || errorText}`;
            } catch {
                errorMessage += ` 详情: ${errorText}`;
            }
            return { success: false, error: errorMessage };
        }

        const data = await response.json();
        logDebug_ACU('通过连接预设获取到的模型数据:', data);

        let modelsList: any[] = [];
        if (data && data.models && Array.isArray(data.models)) {
            modelsList = data.models;
        } else if (data && data.data && Array.isArray(data.data)) {
            modelsList = data.data;
        } else if (Array.isArray(data)) {
            modelsList = data;
        }

        const modelNames = modelsList
            .map((model: any) => (typeof model === 'string' ? model : (model?.id || model?.model)))
            .filter(Boolean)
            .sort();

        if (modelNames.length === 0) {
            return { success: false, error: '未能解析模型数据或返回的模型列表为空。' };
        }

        return { success: true, models: modelNames };
    } catch (e: any) {
        return { success: false, error: `拉取模型失败: ${e?.message || String(e)}` };
    }
}

/**
 * 从 Embedding / Rerank 完整端点 URL 推导用于拉取 /models 的基础 URL 候选列表。
 */
export function deriveModelListBaseUrls_ACU(endpoint: string): string[] {
    const trimmed = String(endpoint || '').trim().replace(/\/+$/, '');
    if (!trimmed) return [];
    const stripped = trimmed
        .replace(/\/(?:embeddings|rerank|reranker|chat\/completions|completions|models)$/i, '')
        .replace(/\/+$/, '');
    const candidates: string[] = [];
    const push = (url: string) => {
        if (url && !candidates.includes(url)) candidates.push(url);
    };
    push(stripped || trimmed);
    if (stripped && !/\/v\d+$/i.test(stripped)) {
        push(`${stripped}/v1`);
    }
    if (trimmed !== stripped) {
        push(trimmed);
    }
    return candidates;
}

/**
 * 从 Embedding 或 Rerank 端点拉取可用模型列表（复用宿主代理规避浏览器 CORS）。
 */
export async function fetchModelsFromVectorEndpoint_ACU(endpoint: string, apiKey: string): Promise<FetchModelsResult> {
    const baseUrls = deriveModelListBaseUrls_ACU(endpoint);
    if (baseUrls.length === 0) {
        return { success: false, error: '请先填写端点 URL。' };
    }

    let firstError = '';
    for (const baseUrl of baseUrls) {
        try {
            const result = await fetchAvailableModels_ACU(baseUrl, apiKey);
            if (result.success && Array.isArray(result.models) && result.models.length > 0) {
                return {
                    success: true,
                    models: [...result.models].sort(),
                };
            }
            if (!firstError && result.error) {
                firstError = result.error;
            }
        } catch (error: any) {
            if (!firstError) {
                firstError = error?.message || String(error);
            }
        }
    }

    return { success: false, error: firstError || '未能拉取到可用模型列表。' };
}
