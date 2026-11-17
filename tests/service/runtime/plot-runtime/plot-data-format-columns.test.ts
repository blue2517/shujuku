/**
 * tests/service/runtime/plot-runtime/plot-data-format-columns.test.ts
 * 剧情推进按列投影纪要内容单元测试
 */
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../../src/shared/utils', () => ({
  logDebug_ACU: vi.fn(),
  logError_ACU: vi.fn(),
  logWarn_ACU: vi.fn(),
}));

vi.mock('../../../../src/service/runtime/state-manager', () => ({
  getCurrentIsolationKey_ACU: () => '',
}));

vi.mock('../../../../src/service/worldbook/worldbook-service', () => ({
  getLorebookEntries_ACU: vi.fn(async () => []),
}));

vi.mock('../../../../src/data/gateways/character-gateway', () => ({
  getCharLorebooks_ACU: vi.fn(async () => ({})),
}));

import { formatSummaryRowsForPlotByColumns_ACU } from '../../../../src/service/runtime/plot-runtime/plot-data-format';

describe('formatSummaryRowsForPlotByColumns_ACU', () => {
  const tables = {
    sheet_summary: {
      name: '纪要表',
      content: [
        ['row_id', '编码索引', '时间跨度', '概览', '纪要', '重要对话'],
        ['1', 'AM0001', 'Day 1', '概览一', '完整纪要内容一', '重要对话一'],
        ['2', 'AM0002', 'Day 2', '概览二', '完整纪要内容二', '重要对话二'],
        ['3', 'AM0003', 'Day 3', '概览三', '完整纪要内容三', '重要对话三'],
      ],
    },
  };

  it('仅注入初筛命中的编码，并只渲染所选列（保留 AMxxxx 标题）', () => {
    const result = formatSummaryRowsForPlotByColumns_ACU(tables, {
      columns: ['时间跨度', '纪要'],
      filterIndexCodes: ['AM0001', 'AM0003'],
    });

    expect(result.success).toBe(true);
    expect(result.rowCount).toBe(2);
    expect(result.content).toContain('### [AM0001]');
    expect(result.content).toContain('- 时间跨度: Day 1');
    expect(result.content).toContain('- 纪要: 完整纪要内容一');
    expect(result.content).toContain('### [AM0003]');
    expect(result.content).toContain('- 纪要: 完整纪要内容三');
    expect(result.content).not.toContain('AM0002');
    expect(result.content).not.toContain('概览一');
    expect(result.content).not.toContain('重要对话一');
  });

  it('未传 filterIndexCodes 时全量按所选列渲染', () => {
    const result = formatSummaryRowsForPlotByColumns_ACU(tables, {
      columns: ['概览', '重要对话'],
      filterIndexCodes: null,
    });

    expect(result.success).toBe(true);
    expect(result.rowCount).toBe(3);
    expect(result.content).toContain('- 概览: 概览二');
    expect(result.content).toContain('- 重要对话: 重要对话二');
    expect(result.content).not.toContain('完整纪要内容二');
  });

  it('单条编码内部字段始终按纪要表原始列顺序排列，与勾选顺序无关', () => {
    const result = formatSummaryRowsForPlotByColumns_ACU(tables, {
      columns: ['纪要', '概览', '时间跨度'],
      filterIndexCodes: ['AM0001'],
    });

    expect(result.success).toBe(true);
    const timePos = result.content.indexOf('- 时间跨度: Day 1');
    const summaryPos = result.content.indexOf('- 概览: 概览一');
    const detailPos = result.content.indexOf('- 纪要: 完整纪要内容一');
    expect(timePos).toBeGreaterThan(-1);
    expect(summaryPos).toBeGreaterThan(timePos);
    expect(detailPos).toBeGreaterThan(summaryPos);
  });
});
