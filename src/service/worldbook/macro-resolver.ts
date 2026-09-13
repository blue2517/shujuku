/**
 * src/service/worldbook/macro-resolver.ts — 世界书宏解析器
 *
 * 负责对世界书条目内容中包含的酒馆宏（如 {{webSearchResults}}, {{user}}, {{char}}, {{getvar::...}} 等）
 * 进行动态展开，对齐酒馆原生 Lorebook 插入上下文时的宏替换机制。
 */

import { SillyTavern_API_ACU, TavernHelper_API_ACU } from '../../shared/host-api';
import { logWarn_ACU } from '../../shared/utils';

/**
 * 替换世界书条目文本中的酒馆宏（同步模式）
 *
 * @param text 待替换的条目文本
 * @returns 宏展开后的真实文本。若环境不可用或发生错误，安全降级返回原文本。
 */
export function substituteWorldbookMacros_ACU(text: string): string {
    if (!text || typeof text !== 'string') return text || '';
    if (!text.includes('{{')) return text;

    try {
        const globalScope: any = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);
        const st = globalScope?.SillyTavern || SillyTavern_API_ACU;
        const ctx = typeof st?.getContext === 'function' ? st.getContext() : null;

        // 1. 优先调用 SillyTavern.getContext().substituteParamsExtended
        // 这是酒馆最完整的宏解析引擎，支持扩展注册宏（如 webSearchResults）与变量宏
        if (typeof ctx?.substituteParamsExtended === 'function') {
            const res = ctx.substituteParamsExtended(text);
            if (typeof res === 'string') return res;
        }

        // 2. 尝试 TavernHelper 提供的 substitudeMacros
        const th = globalScope?.TavernHelper || TavernHelper_API_ACU;
        if (typeof th?.substitudeMacros === 'function') {
            const res = th.substitudeMacros(text);
            if (typeof res === 'string') return res;
        }

        // 3. 降级尝试 SillyTavern.getContext().substituteParams
        if (typeof ctx?.substituteParams === 'function') {
            const res = ctx.substituteParams(text);
            if (typeof res === 'string') return res;
        }

        // 4. 降级尝试全局宏解析函数
        if (typeof globalScope?.substituteParamsExtended === 'function') {
            const res = globalScope.substituteParamsExtended(text);
            if (typeof res === 'string') return res;
        }
        if (typeof globalScope?.substitudeMacros === 'function') {
            const res = globalScope.substitudeMacros(text);
            if (typeof res === 'string') return res;
        }
        if (typeof globalScope?.substituteParams === 'function') {
            const res = globalScope.substituteParams(text);
            if (typeof res === 'string') return res;
        }
    } catch (error) {
        logWarn_ACU('[Worldbook] 解析条目宏失败，保留原文本:', error);
    }

    return text;
}

/**
 * 替换世界书条目文本中的酒馆宏（异步模式，完整支持可能返回 Promise 的宏扩展）
 *
 * @param text 待替换的条目文本
 * @returns 宏展开后的真实文本。
 */
export async function substituteWorldbookMacrosAsync_ACU(text: string): Promise<string> {
    if (!text || typeof text !== 'string') return text || '';
    if (!text.includes('{{')) return text;

    try {
        const globalScope: any = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);
        const st = globalScope?.SillyTavern || SillyTavern_API_ACU;
        const ctx = typeof st?.getContext === 'function' ? st.getContext() : null;

        // 1. 优先调用 SillyTavern.getContext().substituteParamsExtended
        if (typeof ctx?.substituteParamsExtended === 'function') {
            const res = ctx.substituteParamsExtended(text);
            const resolved = res instanceof Promise ? await res : res;
            if (typeof resolved === 'string') return resolved;
        }

        // 2. 尝试 TavernHelper 提供的 substitudeMacros
        const th = globalScope?.TavernHelper || TavernHelper_API_ACU;
        if (typeof th?.substitudeMacros === 'function') {
            const res = th.substitudeMacros(text);
            const resolved = res instanceof Promise ? await res : res;
            if (typeof resolved === 'string') return resolved;
        }

        // 3. 降级尝试 SillyTavern.getContext().substituteParams
        if (typeof ctx?.substituteParams === 'function') {
            const res = ctx.substituteParams(text);
            const resolved = res instanceof Promise ? await res : res;
            if (typeof resolved === 'string') return resolved;
        }

        // 4. 降级尝试全局宏解析函数
        if (typeof globalScope?.substituteParamsExtended === 'function') {
            const res = globalScope.substituteParamsExtended(text);
            const resolved = res instanceof Promise ? await res : res;
            if (typeof resolved === 'string') return resolved;
        }
        if (typeof globalScope?.substitudeMacros === 'function') {
            const res = globalScope.substitudeMacros(text);
            const resolved = res instanceof Promise ? await res : res;
            if (typeof resolved === 'string') return resolved;
        }
        if (typeof globalScope?.substituteParams === 'function') {
            const res = globalScope.substituteParams(text);
            const resolved = res instanceof Promise ? await res : res;
            if (typeof resolved === 'string') return resolved;
        }
    } catch (error) {
        logWarn_ACU('[Worldbook] 异步解析条目宏失败，保留原文本:', error);
    }

    return text;
}
