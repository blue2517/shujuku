/**
 * tests/service/worldbook/macro-resolver.test.ts
 * 世界书条目宏解析器 单元测试
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  substituteWorldbookMacros_ACU,
  substituteWorldbookMacrosAsync_ACU,
} from '../../../src/service/worldbook/macro-resolver';

describe('macro-resolver', () => {
  const originalWindow = globalThis.window;

  beforeEach(() => {
    // Reset global window mocks
    (globalThis as any).window = {};
  });

  afterEach(() => {
    (globalThis as any).window = originalWindow;
    vi.restoreAllMocks();
  });

  describe('substituteWorldbookMacros_ACU (同步模式)', () => {
    it('文本为空或不含宏语法时走快速旁路直接返回', () => {
      expect(substituteWorldbookMacros_ACU('')).toBe('');
      expect(substituteWorldbookMacros_ACU('普通纯文本设定')).toBe('普通纯文本设定');
      expect(substituteWorldbookMacros_ACU(null as any)).toBe('');
      expect(substituteWorldbookMacros_ACU(undefined as any)).toBe('');
    });

    it('优先调用 SillyTavern.getContext().substituteParamsExtended 展开宏', () => {
      const mockSubstitute = vi.fn((text: string) => {
        return text.replace('{{webSearchResults}}', '【搜索结果：Fate/stay night 官方设定集】');
      });

      (globalThis as any).window = {
        SillyTavern: {
          getContext: () => ({
            substituteParamsExtended: mockSubstitute,
          }),
        },
      };

      const raw = '<原著补充材料>\n{{webSearchResults}}';
      const result = substituteWorldbookMacros_ACU(raw);

      expect(result).toBe('<原著补充材料>\n【搜索结果：Fate/stay night 官方设定集】');
      expect(mockSubstitute).toHaveBeenCalledWith(raw);
    });

    it('当 substituteParamsExtended 不可用时，降级使用 TavernHelper.substitudeMacros', () => {
      const mockTHSubstitute = vi.fn((text: string) => {
        return text.replace('{{user}}', '卫宫士郎').replace('{{char}}', '远坂凛');
      });

      (globalThis as any).window = {
        TavernHelper: {
          substitudeMacros: mockTHSubstitute,
        },
      };

      const raw = '{{user}} 与 {{char}} 结盟。';
      const result = substituteWorldbookMacros_ACU(raw);

      expect(result).toBe('卫宫士郎 与 远坂凛 结盟。');
      expect(mockTHSubstitute).toHaveBeenCalledWith(raw);
    });

    it('当前两者不可用时，降级使用 SillyTavern.getContext().substituteParams', () => {
      const mockSTSubstitute = vi.fn((text: string) => {
        return text.replace('{{date}}', '2024-01-01');
      });

      (globalThis as any).window = {
        SillyTavern: {
          getContext: () => ({
            substituteParams: mockSTSubstitute,
          }),
        },
      };

      const raw = '记录于 {{date}}';
      const result = substituteWorldbookMacros_ACU(raw);

      expect(result).toBe('记录于 2024-01-01');
      expect(mockSTSubstitute).toHaveBeenCalledWith(raw);
    });

    it('当挂在全局的宏替换函数存在时能正确调用', () => {
      const mockGlobalSubstitute = vi.fn((text: string) => {
        return text.replace('{{getvar::level}}', 'Lv.99');
      });

      (globalThis as any).window = {
        substituteParams: mockGlobalSubstitute,
      };

      const raw = '当前等级：{{getvar::level}}';
      const result = substituteWorldbookMacros_ACU(raw);

      expect(result).toBe('当前等级：Lv.99');
      expect(mockGlobalSubstitute).toHaveBeenCalledWith(raw);
    });

    it('宿主接口调用抛出异常时安全防御，降级返回原文本不崩溃', () => {
      (globalThis as any).window = {
        SillyTavern: {
          getContext: () => ({
            substituteParamsExtended: () => {
              throw new Error('Host macro syntax parsing exploded');
            },
          }),
        },
      };

      const raw = '出故障的宏条目：{{malformed_macro}}';
      const result = substituteWorldbookMacros_ACU(raw);

      expect(result).toBe(raw);
    });
  });

  describe('substituteWorldbookMacrosAsync_ACU (异步模式)', () => {
    it('能够正确 await 异步返回的 Promise 宏展开结果', async () => {
      const mockAsyncSubstitute = vi.fn(async (text: string) => {
        return text.replace('{{webSearchResults}}', '异步联网结果：冬木市天然气管道老化事故');
      });

      (globalThis as any).window = {
        SillyTavern: {
          getContext: () => ({
            substituteParamsExtended: mockAsyncSubstitute,
          }),
        },
      };

      const raw = '新闻报道：{{webSearchResults}}';
      const result = await substituteWorldbookMacrosAsync_ACU(raw);

      expect(result).toBe('新闻报道：异步联网结果：冬木市天然气管道老化事故');
      expect(mockAsyncSubstitute).toHaveBeenCalledWith(raw);
    });

    it('异步接口抛出 reject 时安全降级返回原文本', async () => {
      (globalThis as any).window = {
        SillyTavern: {
          getContext: () => ({
            substituteParamsExtended: async () => {
              throw new Error('Async network timeout');
            },
          }),
        },
      };

      const raw = '超时条目：{{webSearchResults}}';
      const result = await substituteWorldbookMacrosAsync_ACU(raw);

      expect(result).toBe(raw);
    });
  });
});
