import { describe, it, expect, vi } from 'vitest';
import { resolvePromptRowWindow_ACU } from '../../../src/service/ai/prompt-builder/prompt-prepare';

describe('按需动态行窗口 (Dynamic Row Window)', () => {
  const sampleHeaders = ['row_id', '姓名', '性别/年龄', '是否离场', '实力/能力'];

  function createRows(count: number): any[][] {
    const rows: any[][] = [];
    for (let i = 0; i < count; i++) {
      rows.push([
        String(i + 1),
        `角色_${i + 1}`,
        '男/18',
        '是', // 默认全部已离场
        '普通人',
      ]);
    }
    return rows;
  }

  it('当全表行数未超过门槛（阈值 20）时，不触发动态过滤，全量返回', () => {
    const rows = createRows(15);
    const table = {
      name: '重要角色表',
      content: [sampleHeaders, ...rows],
      exportConfig: {
        enabled: true,
        splitByRow: true,
        entryType: 'keyword',
        dynamicWindowEnabled: true,
        dynamicWindowThreshold: 20,
        dynamicWindowFilterColumn: '是否离场',
        dynamicWindowFilterValue: '否',
        dynamicWindowLatestRows: 2,
        keywords: '姓名',
      },
    };

    const result = resolvePromptRowWindow_ACU(table, rows, {
      flightModeEnabled: false,
      messages: [{ mes: '没有任何人出现' }],
    });

    expect(result.rowsToProcess.length).toBe(15);
    expect(result.rowIndices).toBeUndefined();
    expect(result.limitNote).toBeUndefined();
  });

  it('超过门槛但 dynamicWindowEnabled 未开启时，保持默认行为', () => {
    const rows = createRows(25);
    const table = {
      name: '重要角色表',
      content: [sampleHeaders, ...rows],
      exportConfig: {
        enabled: true,
        splitByRow: true,
        entryType: 'keyword',
        dynamicWindowEnabled: false,
        dynamicWindowThreshold: 20,
      },
    };

    const result = resolvePromptRowWindow_ACU(table, rows, {
      flightModeEnabled: false,
      messages: [],
    });

    expect(result.rowsToProcess.length).toBe(25);
    expect(result.rowIndices).toBeUndefined();
  });

  it('超过门槛且开启动态窗口：支持“状态列常驻”、“最新缓冲”和“多别名关键词召回”并集', () => {
    const rows = createRows(30);

    // 设定行 3：在场（是否离场 = 否）
    rows[3][1] = '间桐樱';
    rows[3][3] = '否';

    // 设定行 10：包含逗号别名（美狄亚,Caster）
    rows[10][1] = '美狄亚,Caster';
    rows[10][3] = '是'; // 虽然离场，但对话中出现即召回

    // 设定行 15：包含中文逗号别名（阿尔托莉雅，Saber）
    rows[15][1] = '阿尔托莉雅，Saber';
    rows[15][3] = '是';

    // 设定末尾两行（索引 28, 29）为最新缓冲

    const table = {
      name: '重要角色表',
      content: [sampleHeaders, ...rows],
      exportConfig: {
        enabled: true,
        splitByRow: true,
        entryType: 'keyword',
        dynamicWindowEnabled: true,
        dynamicWindowThreshold: 20,
        dynamicWindowFilterColumn: '是否离场',
        dynamicWindowFilterValue: '否',
        dynamicWindowLatestRows: 2,
        dynamicWindowKeywordRounds: 5,
        keywords: '姓名',
      },
    };

    // 最新对话只提到了 "Caster"（命中别名）和 "阿尔托莉雅"
    const messages = [
      { mes: '远坂同学，刚才在深山町感知到了Caster的魔力痕迹。' },
      { mes: '阿尔托莉雅立刻拔出了誓约胜利之剑警戒。' },
    ];

    const result = resolvePromptRowWindow_ACU(table, rows, {
      flightModeEnabled: false,
      messages,
    });

    // 期望命中：
    // - 行 3：状态列匹配（是否离场 == 否）
    // - 行 10：关键词命中了 "Caster"（与任意匹配）
    // - 行 15：关键词命中了 "阿尔托莉雅"
    // - 行 28, 29：最新新增保底（最后 2 行）
    expect(result.rowIndices).toEqual([3, 10, 15, 28, 29]);
    expect(result.rowsToProcess.length).toBe(5);
    expect(result.rowsToProcess.map(r => r[1])).toEqual([
      '间桐樱',
      '美狄亚,Caster',
      '阿尔托莉雅，Saber',
      '角色_29',
      '角色_30',
    ]);
    expect(result.limitNote).toContain('Dynamic row window active: Showing 5 of 30 entries');
  });

  it('关键词扫描轮数限制：超出指定轮数的历史对话不触发召回', () => {
    const rows = createRows(25);
    rows[5][1] = '柳洞一成';
    rows[5][3] = '是';

    const table = {
      name: '重要角色表',
      content: [sampleHeaders, ...rows],
      exportConfig: {
        enabled: true,
        splitByRow: true,
        entryType: 'keyword',
        dynamicWindowEnabled: true,
        dynamicWindowThreshold: 20,
        dynamicWindowFilterColumn: '是否离场',
        dynamicWindowFilterValue: '否',
        dynamicWindowLatestRows: 0, // 禁用最新缓冲
        dynamicWindowKeywordRounds: 1, // 仅扫描最新 1 轮（2 条消息）
        keywords: '姓名',
      },
    };

    // 柳洞一成在很久以前的第 1 条消息中出现，最新 2 条消息没有他
    const messages = [
      { mes: '柳洞一成曾经提醒过主角。' }, // 较早消息（超出范围）
      { mes: '夜幕降临了。' }, // 最新轮次 1
      { mes: '主角回到了卫宫宅邸。' }, // 最新轮次 2
    ];

    const result = resolvePromptRowWindow_ACU(table, rows, {
      flightModeEnabled: false,
      messages,
    });

    // 柳洞一成不应该被召回，因为只扫描最新 1 轮（2 条消息）
    expect(result.rowIndices).toEqual([]);
    expect(result.rowsToProcess.length).toBe(0);
  });
});
