(function() {
  "use strict";
  const onboardingContent$1 = {
    /** Title on the very first screen and in the panel header. */
    title: "Kemini Dramatron 雪融雪降v2",
    subtitle: "首次使用配置",
    introduction: `本预设为 gemini 3.7 flash 准备，请勿用错模型。

接下来会问你几个问题，然后自动把预设里对应的条目配置好。
你不需要自己去翻提示词列表。

一路点「下一步」也可以——默认选项就是预设出厂的样子，不会改动任何东西。`,
    /**
     * Page one, in large red type. The one thing on that page nobody may skim past.
     *
     * Deliberately duplicates the softer `fireDawnNotice` further into the flow: by the time
     * that page arrives the user has already made a dozen choices, and the ones who bounce off
     * the preset are the ones who never got there.
     */
    introNotice: `下一步必须更换小说，不能跳过。`,
    /** Shown before the questions, covering things that live outside the preset. */
    environmentGuide: `有两件事得先在酒馆里改，预设管不到：

提示词后处理选「严格（不带工具）」。

高度依赖预填充的插件，如果装了，关掉。

另外：build / api 渠道推荐白天玩，晚上甲厚。`,
    /** Shown before the 防截断 / NSFW questions, which are the 破甲 levers. */
    jailbreakGuide: `破甲强度可以靠三样东西叠加：雪融雪降、防截断、NSFW。

但它们都是有条件的：

· NSFW 只在角色卡本身带 NSFW 时才有破甲效果
· 两种防截断防输出审查没有差别，牢大的区别是能防某些渠道的输入审查，换着用
· 用不上却开着，这两个是反效果

实测：破甲没全开、配一张 1k token 的直球鬼佬小卡，可以过 v 站 0 层蜀山；api / build 渠道 0 层直球。据反馈也能破 5op。`,
    /** Rendered in large type on the 破甲 page. Must not be skimmed past. */
    jailbreakDisclaimer: `只有 prohibited 报错 / text empty / 道歉 属于预设问题，其余请自查环境。`,
    /**
     * Now the FIRST thing after the welcome page, by the author's instruction — it used to sit
     * two thirds of the way in, under 「还是破不开？」, which is a heading you only read if you
     * already have a problem. People were finishing the wizard without ever seeing it.
     */
    fireDawnGuide: `雪融雪降里填充的是一段小说。这一段必须换成你自己的，不能跳过。

秒截断基本就是这一步没做好。

7000 token 是下限，宁超勿少（是 token，不是字数，中文字数通常要更多）。

两件事要避开：
不要用黄文。
不要用别人也可能拿来换的段落——用的人一多就等于没换。想用的书太热门的话，往后翻几百章找一段冷的。`,
    /** Rendered in large type on that page, same weight as the 破甲 disclaimer. */
    fireDawnNotice: `必须换。秒截断就是这一步没做好。`,
    /** Shown on the review screen, above the diff. */
    reviewIntro: `请确认下面的调整。应用之后，你随时可以重新打开控制台修改。`,
    /** Shown after a successful apply. */
    completion: `当前预设已经根据你的使用习惯完成调整。

以后可以通过聊天输入框上方的「⚙ Kemini」按钮重新打开配置。`,
    /** Nudge toward running the compatibility check. */
    diagnosticsInvitation: `建议现在运行一次生成诊断，确认当前模型与 API 能够正常配合这个预设工作。`
  };
  const dashboardContent$1 = {
    about: `Kemini Dramatron 雪融雪降v2 · 伴生面板。

这是一个随预设分发的配置与诊断工具：
· 首次使用时引导你完成关键选项配置
· 之后可随时重新配置
· 出现生成失败时，帮你看清楚究竟是哪里报错

本面板只会修改作者明确登记过的少数条目，不会改动预设的其他内容，
也不会修改你的聊天记录、角色卡或世界书。`,
    credits: `感谢和我一起研究的渣、牢大、hermes、反恐精英之神啊！！！，还有老秦之前那个 xxx，还有奶桶头的 vertex json。`
  };
  const identity = {
    displayName: "Kemini Dramatron 雪融雪降v2.9",
    // The preset JSON carries no version field of its own, so this mirrors the filename.
    // Set it by hand on each release.
    presetVersion: "2.9",
    /*
     * Survives users renaming the preset ("Kemini Dramatron v3 我的改版").
     *
     * `kemini` is deliberately NOT in this list even though it is in the shipped name: the
     * author's other preset is called "Kemini Aether", so matching on it would make each
     * panel claim the other's preset by name. Identity then rests on `dramatron` plus the name
     * of the day and the uuid check below, none of which the two presets share.
     *
     * Renamed twice: 火之晨曦 → 纵心亡魔心仍不悔 (2026-08-27) → 雪融雪降 (2026-08-31). Every old
     * name stays listed so anyone still running a previous export is still recognised.
     *
     * 亡魔心仍不悔 covers both spellings of the middle name at once: that export's FILE said
     * 纵心 while the prompt inside said 纵身, so matching on the shared tail catches both.
     */
    namePatterns: ["dramatron", "雪融雪降", "亡魔心仍不悔", "火之晨曦"],
    identifyByRegisteredPrompts: true,
    allowManualOpenWhenUnmatched: true
  };
  const launcherButtonName = "⚙ Kemini";
  const transportButtonName = "🛡 防截断";
  const configSchemaVersion = 1;
  const transportControlAnchor = "<format>";
  const STYLE_STRONG_SUBJECTIVE = {
    stableId: "32cf2d73-0401-47ef-b503-cf9a84910d7a",
    nameFallbacks: ["✒️文风：强主观"]
  };
  const DATA_BLOCK_END = {
    stableId: "10ee0833-1b61-47e0-b05a-7418b0704972",
    nameFallbacks: ["💠</DATA>"]
  };
  const SUMMARY = {
    stableId: "3d2602ee-d297-44a0-b693-0c2d0d9084ac",
    nameFallbacks: ["🔖摘要"]
  };
  const configurablePrompts$1 = [
    {
      key: "icotThreePart",
      displayName: "文笔与篇幅优先",
      stableId: "fd9adcfd-bbbe-447e-8be6-4f1d87e50da7",
      nameFallbacks: ["📽️ICOT（三段）"]
    },
    {
      key: "cotFormatFriendly",
      displayName: "稳定与可控优先",
      stableId: "c127ada4-2a95-4cb6-a5dd-ca7eed0b3080",
      nameFallbacks: ["📽️COT（格式友好型）"]
    },
    /**
     * The 空回 defences. Mutually exclusive — at most one is ever on.
     *
     * ── Author's notes (ground truth, do not re-interpret) ─────────────────────────────
     *   · The symptom to ask users about is 空回 (an empty response), not 截断. An earlier
     *     draft asked about truncation and was corrected — keep the wizard wording as-is.
     *   · 牢大防截断 and 普通防截断 are COMPLEMENTARY, not a weak/strong pair. They are
     *     alternatives to swap between: if one does not fix it, try the other.
     *   · On OUTPUT-side moderation the two are equivalent, and 普通防截断 may even be the
     *     stronger of the pair. 牢大防截断's distinguishing property is that it guards against
     *     INPUT-side moderation (输入审查) on some channels. Neither is "the better one" —
     *     that is precisely why the wizard tells users to swap rather than to upgrade.
     *   · Switching one on when you do not need it is actively counterproductive (反效果).
     *
     * The complementarity is why the wizard is phrased as "try this one → still broken? try
     * the other" rather than as a severity ladder, which would steer users the wrong way.
     *
     * Driven by its own question rather than by the CoT choice, so the two axes stay
     * independent: someone on COT who still gets 空回 can turn one on.
     *
     * Preset's shipped state: both off.
     */
    {
      key: "defenseNormal",
      displayName: "普通防截断",
      stableId: "095b5c1f-cf5f-48e8-a6aa-e25c882ea754",
      nameFallbacks: ["💿普通防截断"]
    },
    {
      key: "defenseStrong",
      displayName: "牢大防截断",
      stableId: "558c204b-25ad-4284-9d03-369b00ac9ad4",
      nameFallbacks: ["📐牢大防截断"],
      description: "防输出审查和普通没有差别；区别是它能防某些渠道的输入审查。"
    },
    /**
     * ── RESERVED SLOT — 防截断新 ────────────────────────────────────────────────────────
     * A third defence, sibling to the two above. Not in the preset yet.
     *
     * TO ACTIVATE: add a prompt to the preset named exactly `📐防截断新` (anywhere in the
     * prompt list — the wizard only toggles it, position is yours to choose). Nothing else
     * is required; the name fallback below will find it and the wizard option appears.
     *
     * Optional hardening once it exists: replace `stableId` with the prompt's real uuid so
     * matching survives a rename. The placeholder below is deliberately not uuid-shaped so
     * it can never collide with a real identifier.
     */
    {
      key: "defenseNew",
      displayName: "防截断新",
      stableId: "PENDING:defense-new",
      nameFallbacks: ["📐防截断新"],
      pending: true
    },
    /**
     * ── Author's note (ground truth) ───────────────────────────────────────────────────
     *   Turn on when the character card already carries NSFW content; doing so strengthens
     *   2022 破甲.
     *
     * Bound by uuid, NOT by the `nsfw` system identifier — this preset also contains a
     * separate, unrelated system prompt under `identifier: 'nsfw'` (named
     * `123213wsdasdasdasda`, disabled) which must never be touched. The preset↔registry test
     * asserts we never target reserved identifiers.
     *
     * The body is a plain `<sex_style>` block with no macros, so a user override replaces the
     * whole content — same DESTRUCTIVE arrangement as 💠雪融雪降, and gated behind an explicit
     * choice for the same reason.
     *
     * Preset's shipped state: off.
     */
    {
      key: "nsfwBoost",
      displayName: "NSFW",
      stableId: "7018a048-21ea-438f-8b57-af90b06127ce",
      nameFallbacks: ["💗NSFW"],
      description: "角色卡自带 NSFW 时开启，可增强 2022 破甲。",
      variables: [
        { name: "content", displayName: "NSFW 提示词", wholeContent: true, kind: "block" }
      ]
    },
    /**
     * Writing style. Mutually exclusive — exactly one is on.
     *
     * `description` deliberately unset on all three (author: 无描述). The labels are the
     * author's own prompt names, so the wizard says nothing the preset does not already say.
     *
     * Preset's shipped state: 视觉小说 on, other two off.
     */
    {
      key: "styleVisualNovel",
      displayName: "文风：视觉小说",
      stableId: "f67b3638-2808-4cc0-a167-4f8ecc464e30",
      nameFallbacks: ["✒️文风：视觉小说"]
    },
    {
      key: "styleLightNovel",
      displayName: "文风：轻小说",
      stableId: "dfffb119-7c25-4d9e-a178-0dc118f5052e",
      nameFallbacks: ["✒️文风：轻小说"]
    },
    {
      key: "styleStrongSubjective",
      displayName: "文风：强主观",
      stableId: "32cf2d73-0401-47ef-b503-cf9a84910d7a",
      nameFallbacks: ["✒️文风：强主观"]
    },
    /**
     * The user's own writing style.
     *
     * The three shipped styles are structurally identical — `role: system`,
     * `injection_position: 0`, `depth: 4`, `order: 100`, body `{{setvar::writingstyle::…}}`,
     * consumed by 🎬ROLE AND GUIDE — so this one is cloned from 强主观 and inserted directly
     * after it, keeping all four together in the prompt list.
     *
     * The uuid is fixed (not generated per install) so the prompt is found again on the next
     * run instead of being recreated.
     *
     * NOTE: this prompt does not exist in the shipped preset file, which is read-only here.
     * It is created in the IN-USE preset only, and only if the user picks 自定义.
     */
    {
      key: "styleCustom",
      displayName: "文风：自己缝合",
      stableId: "d340c398-93ad-48bc-80fd-acedb1942418",
      nameFallbacks: ["✒️文风：自定义"],
      variables: [{ name: "writingstyle", displayName: "自定义文风" }],
      createFrom: {
        template: STYLE_STRONG_SUBJECTIVE,
        insertAfter: STYLE_STRONG_SUBJECTIVE,
        name: "✒️文风：自定义",
        initialContent: "{{setvar::writingstyle:: }}"
      }
    },
    /**
     * ── The 自填 / 自改 prompts ────────────────────────────────────────────────────────
     * These two exist to be filled in by the user, so the panel edits their VALUE rather
     * than toggling them. Both ship enabled and both stay enabled — no rule touches their
     * `enabled` flag.
     *
     *   🎞️剧情偏好（自填）   {{setvar::plot:: }}
     *       consumed mid-sentence by both CoTs:
     *       "…你又该给出怎样的剧情走向{{getvar::plot}}，列出两者对比并取用后者"
     *
     *   🗃️人称设置（自改）   {{setvar::rencheng::\n- 忽略<Interaction_history>，必须以**第三人称**创作正文}}
     *       consumed by ⚙️SETTING; the prompt also carries a `{{// …}}` author comment
     *       explaining how to adapt it, which the rewriter preserves untouched.
     */
    {
      key: "plotPreference",
      displayName: "剧情偏好",
      stableId: "c5ee4b21-9512-4c6c-8168-57855323f7ac",
      nameFallbacks: ["🎞️剧情偏好（自填）"],
      variables: [{ name: "plot", displayName: "剧情偏好" }]
    },
    {
      key: "personSetting",
      displayName: "人称设置",
      stableId: "a411becb-0397-4779-b38a-ec6d222d1f87",
      nameFallbacks: ["🗃️人称设置（自改）"],
      variables: [{ name: "rencheng", displayName: "人称设置" }]
    },
    /**
     * ── Independent extras ─────────────────────────────────────────────────────────────
     * Presented as one multi-select page. Each is its own toggle with no interdependency,
     * so no `description` (author: 无需注释) and no exclusivity rules.
     *
     * `displayName` is the author's own prompt name, emoji included, so a row in the diff
     * matches what the user sees in SillyTavern's prompt manager one-for-one.
     *
     * Preset's shipped state: 🤖防机械化 on, the other eight off.
     */
    {
      key: "antiSycophancy",
      displayName: "⚓不媚USER",
      stableId: "44c32464-85df-4bc3-aa2c-af84e613c967",
      nameFallbacks: ["⚓不媚USER"]
    },
    {
      key: "antiDomination",
      displayName: "⚖️防支配",
      stableId: "acb6b76e-4ada-47b7-b3ad-108aad71c520",
      nameFallbacks: ["⚖️防支配"]
    },
    {
      key: "antiOmniscience",
      displayName: "💡防全知",
      stableId: "5f3297ec-c030-4eb4-ab5d-9bbbc5888f43",
      nameFallbacks: ["💡防全知"]
    },
    {
      key: "dialogueBoost",
      displayName: "📣对话加强",
      stableId: "c48c8ec7-5ae9-4d73-8a81-9667bd04063e",
      nameFallbacks: ["📣对话加强"]
    },
    {
      key: "narrationBoost",
      displayName: "📢加強转述",
      stableId: "a4ae2334-7ad2-4111-8776-837190aa7034",
      nameFallbacks: ["📢加強转述"]
    },
    {
      key: "antiMechanical",
      displayName: "🤖防机械化",
      stableId: "98a649d4-dc29-4cca-a174-152ff190c9f9",
      nameFallbacks: ["🤖防机械化"]
    },
    // 💬抢话 and 💬不抢话 both write {{setvar::qianghua}}. They are exposed as two
    // independent toggles by request; if both are on, the one later in the preset's prompt
    // order (💬不抢话) wins. No rule enforces exclusivity.
    {
      key: "interrupt",
      displayName: "💬抢话",
      stableId: "c196c006-99b3-4f3d-9fd8-5488d45bedaa",
      nameFallbacks: ["💬抢话"]
    },
    {
      key: "noInterrupt",
      displayName: "💬不抢话",
      stableId: "924ad6d1-28ac-46aa-92aa-b94eecbe65cb",
      nameFallbacks: ["💬不抢话"]
    },
    {
      key: "pronounControl",
      displayName: "🔍人称代词控制",
      stableId: "02741377-dfdd-4c21-a818-3b38d1b7a5b7",
      nameFallbacks: ["🔍人称代词控制"]
    },
    /**
     * ── Own-question extras ────────────────────────────────────────────────────────────
     * Two toggles the author added in v2.6 (2026-09-01) and asked to be their OWN questions
     * rather than rows on the 还要开启哪些条目？multi-select. Mechanically identical to the
     * extras above — plain on/off, no content is written — but each gets a page, so they are
     * deliberately NOT in `extraToggleKeys`.
     *
     * `nameFallbacks` carry the emoji prefix on purpose: the preset also contains an empty
     * prompt named plainly `选项`, and a bare `选项` fallback could resolve to that one.
     *
     * Preset's shipped state: both off.
     */
    {
      key: "actionOptions",
      displayName: "行动选项",
      stableId: "92c492fb-6168-4239-9768-08f32f04235e",
      nameFallbacks: ["📘选项"]
    },
    {
      key: "bilingualDialogue",
      displayName: "双语对白",
      stableId: "fdd47432-966d-43ee-934c-fd8ff39a8691",
      nameFallbacks: ["💬双语对白"]
    },
    {
      key: "innerMonologue",
      displayName: "内心戏",
      stableId: "0d9f169e-a58a-496c-ac2b-de6fc97a9238",
      nameFallbacks: ["💬内心戏"]
    },
    /**
     * ── User-supplied insertion points ─────────────────────────────────────────────────
     * Two empty slots the user can drop their own text into. Neither ships with the preset;
     * both are created on demand and only while the box is non-empty, so a user who ignores
     * them ends up with a preset containing no extra entries.
     *
     * Positions were chosen by the author:
     *   · 自定义缝合处      immediately BEFORE 💠</DATA>, i.e. at the end of the data block
     *   · 自定义格式缝合处  immediately BEFORE 🔖摘要, i.e. in the formatting region
     *
     * Both clone their anchor's metadata (system / relative / depth 4 / order 100), which is
     * uniform across that whole part of the preset.
     */
    {
      key: "customStitch",
      displayName: "自定义缝合处",
      stableId: "0a705a10-0541-44ee-a065-701d6cfca2f8",
      nameFallbacks: ["💠自定义缝合处"],
      variables: [{ name: "content", displayName: "自定义缝合处", wholeContent: true, kind: "block" }],
      createFrom: {
        template: DATA_BLOCK_END,
        insertBefore: DATA_BLOCK_END,
        name: "💠自定义缝合处",
        initialContent: " "
      }
    },
    {
      key: "customFormatStitch",
      displayName: "自定义格式缝合处",
      stableId: "95273628-9b4f-479f-b27a-b08765236103",
      nameFallbacks: ["💠自定义格式缝合处"],
      variables: [
        { name: "content", displayName: "自定义格式缝合处", wholeContent: true, kind: "block" }
      ],
      createFrom: {
        template: SUMMARY,
        insertBefore: SUMMARY,
        name: "💠自定义格式缝合处",
        initialContent: " "
      }
    },
    /**
       * 💠雪融雪降 — the jailbreak filler. Named 💠火之晨曦 before 2026-08-27 and
       * 💠雪融雪降 before 2026-08-31; both old names are kept as fallbacks so a user still
       * on a previous export is not left stranded. Matching is by `stableId` first, so the
       * fallbacks only matter for a preset whose identifier was regenerated.
    
       *
       *
       * The body is ~11k characters of novel prose with no macros at all, so there is no span
       * to anchor to: the field is the whole content. Replacing it also addresses 截断/空回,
       * which the author notes can be mitigated by swapping this text.
       *
       * ⚠ This one is DESTRUCTIVE by the author's explicit instruction (覆盖原文就覆盖): the
       * original prose is not preserved anywhere, so the wizard says so before writing.
       * Nothing is written unless the user actively chooses to replace it.
       *
       * The prompt ships enabled and is never toggled here.
       */
    {
      key: "fireDawn",
      displayName: "雪融雪降填充文本",
      stableId: "a443f257-0f5d-4286-a1ff-f60653ed6400",
      nameFallbacks: [
        "💠雪融雪降！（build渠道等过不去外审开）",
        "💠纵身亡魔心仍不悔！（build渠道等过不去外审开）",
        "💠火之晨曦！（build渠道等过不去外审开）"
      ],
      variables: [
        {
          name: "novel",
          displayName: "雪融雪降填充文本",
          wholeContent: true,
          kind: "block"
        }
      ]
    },
    /**
     * 💠禁词表 — added by the author 2026-08-27.
     *
     * The ONLY non-destructive content field in the project. The author's list stays exactly as
     * written and the user's words are added underneath it, in the same `- ` format, inside the
     * same `<prohibited_words>` tag. See `AppendLocation` for why this is a rewritten
     * panel-owned block rather than a literal append.
     *
     * The prompt ships enabled and is never toggled here: switching it off would drop the
     * author's own list too, which is not what "I did not add any words" should mean.
     */
    {
      key: "bannedWords",
      displayName: "禁词表",
      stableId: "72f85eed-2728-4ffc-a34f-bc04bced2cf2",
      nameFallbacks: ["💠禁词表"],
      variables: [
        {
          name: "extra",
          displayName: "追加的禁词",
          appendTo: {
            marker: "{{//以下由伴生面板添加，可直接删除}}",
            before: "</prohibited_words>",
            linePrefix: "- "
          },
          kind: "block"
        }
      ]
    },
    /**
     * ⚙️SETTING — the content-constraints block.
     *
     *     - 正文语言：简体中文{{getvar::rencheng}}
     *     - 每次创作字数：{{正文内容}}部分一共不少于1000字
     *
     * Both values are hardcoded LITERALS, not macros, so they are located by regex capture
     * instead of by `{{setvar}}`. Each pattern is deliberately narrow and matches exactly
     * once; if the author rewrites this block the pattern stops matching and the panel
     * reports the field as unavailable rather than editing the wrong span.
     *
     * The prompt ships enabled and is never toggled — only these two spans are written.
     */
    {
      key: "settingBlock",
      displayName: "正文要求",
      stableId: "451043ae-17bf-4162-a45f-2f80eb42ba67",
      nameFallbacks: ["⚙️SETTING"],
      variables: [
        {
          name: "language",
          displayName: "正文语言",
          // Stops before the `{` of the adjacent {{getvar::rencheng}}, and at end of line.
          pattern: { source: "正文语言：([^\\n{]*)" },
          kind: "line"
        },
        {
          name: "wordCount",
          displayName: "每次创作字数",
          pattern: { source: "不少于\\s*(\\d+)\\s*字" },
          kind: "integer"
        }
      ]
    }
  ];
  const configurableRegexes$1 = [
    /**
     * Wraps `<think>…</think>` in a collapsible `<details>` so the chain of thought is
     * readable in the chat. Shipped DISABLED, per the author's 0822 note.
     *
     * Not to be confused with 思维链内部标签剥尖括号 (`9eaced01-…`), a separate helper that
     * stays enabled and is not managed here.
     */
    {
      key: "cotViewer",
      displayName: "思维链折叠显示",
      /*
       * ⚠ Regex ids are NOT stable across an export/import round trip. Every one of this
       * preset's seven regexes was re-minted between the 0822 and 0827 exports (this one was
       * b63f52be-… before). `nameFallbacks` is what actually keeps this working — the id is
       * only a fast path, and is expected to go stale again on the next export.
       */
      stableId: "01930842-5284-4dc6-8e6e-181f310d5362",
      nameFallbacks: ["思维链折叠"]
    }
  ];
  const extraToggleKeys = [
    "antiSycophancy",
    "antiDomination",
    "antiOmniscience",
    "dialogueBoost",
    "narrationBoost",
    "antiMechanical",
    "interrupt",
    "noInterrupt",
    "pronounControl"
  ];
  function hasText(value) {
    return typeof value === "string" && value.trim() !== "";
  }
  const configurationRules$1 = [
    // ── Baseline ───────────────────────────────────────────────────────────────────────
    {
      id: "baseline",
      description: "先关闭所有由本面板管理的 Prompt，再按回答逐项开启。",
      actions: [
        { type: "setPromptEnabled", promptId: "icotThreePart", enabled: false },
        { type: "setPromptEnabled", promptId: "cotFormatFriendly", enabled: false },
        { type: "setPromptEnabled", promptId: "defenseNormal", enabled: false },
        { type: "setPromptEnabled", promptId: "defenseStrong", enabled: false },
        { type: "setPromptEnabled", promptId: "defenseNew", enabled: false },
        { type: "setPromptEnabled", promptId: "nsfwBoost", enabled: false },
        { type: "setPromptEnabled", promptId: "styleVisualNovel", enabled: false },
        { type: "setPromptEnabled", promptId: "styleLightNovel", enabled: false },
        { type: "setPromptEnabled", promptId: "styleStrongSubjective", enabled: false },
        { type: "setPromptEnabled", promptId: "styleCustom", enabled: false },
        { type: "setPromptEnabled", promptId: "customStitch", enabled: false },
        { type: "setPromptEnabled", promptId: "customFormatStitch", enabled: false },
        { type: "setPromptEnabled", promptId: "actionOptions", enabled: false },
        { type: "setPromptEnabled", promptId: "bilingualDialogue", enabled: false },
        { type: "setPromptEnabled", promptId: "innerMonologue", enabled: false },
        ...extraToggleKeys.map(
          (key) => ({ type: "setPromptEnabled", promptId: key, enabled: false })
        )
      ]
    },
    // ── Chain-of-thought variant ───────────────────────────────────────────────────────
    // Exactly one of these is on after any answer: the baseline turned both off, and each
    // branch turns exactly one back on. `tradeoff` has a default, so even a user who clicks
    // straight through ends up with a valid CoT. Asserted exhaustively in ConfigEngine.test.
    {
      id: "tradeoff-expressive",
      description: "文笔与篇幅优先 → 📽️ICOT（三段）",
      when: { tradeoff: "expressive" },
      actions: [{ type: "setPromptEnabled", promptId: "icotThreePart", enabled: true }]
    },
    {
      id: "tradeoff-stable",
      description: "稳定与可控优先 → 📽️COT（格式友好型）",
      when: { tradeoff: "stable" },
      actions: [{ type: "setPromptEnabled", promptId: "cotFormatFriendly", enabled: true }]
    },
    // ── 空回 defences ──────────────────────────────────────────────────────────────────
    // A separate axis from the CoT choice, on purpose: 空回 can happen on either CoT, so a
    // user on COT（格式友好型）can still turn a defence on. `defense: 'none'` matches the
    // preset's shipped state and enables neither.
    //
    // The two defences are complementary alternatives (author's note in promptRegistry), so
    // these rules are a straight either/or — never a fallback chain, and never both.
    {
      id: "defense-normal",
      description: "先试普通 → 💿普通防截断",
      when: { defense: "normal" },
      actions: [{ type: "setPromptEnabled", promptId: "defenseNormal", enabled: true }]
    },
    {
      id: "defense-strong",
      description: "换牢大 → 📐牢大防截断（防输出审查同普通；区别是能防某些渠道的输入审查）",
      when: { defense: "strong" },
      actions: [{ type: "setPromptEnabled", promptId: "defenseStrong", enabled: true }]
    },
    {
      // Reserved slot; unreachable from the UI until 📐防截断新 exists in the preset.
      id: "defense-new",
      description: "换防截断新 → 📐防截断新",
      when: { defense: "newer" },
      actions: [{ type: "setPromptEnabled", promptId: "defenseNew", enabled: true }]
    },
    // ── Own-question extras ────────────────────────────────────────────────────────────
    // Plain on/off, one question each. The baseline above already turned them off, so `false`
    // needs no rule of its own — clicking straight through leaves the preset as shipped.
    {
      id: "action-options",
      description: "行动选项 → 📘选项",
      when: { actionOptions: true },
      actions: [{ type: "setPromptEnabled", promptId: "actionOptions", enabled: true }]
    },
    {
      id: "bilingual-dialogue",
      description: "双语对白 → 💬双语对白",
      when: { bilingualDialogue: true },
      actions: [{ type: "setPromptEnabled", promptId: "bilingualDialogue", enabled: true }]
    },
    {
      id: "inner-monologue",
      description: "内心戏 → 💬内心戏",
      when: { innerMonologue: true },
      actions: [{ type: "setPromptEnabled", promptId: "innerMonologue", enabled: true }]
    },
    // ── NSFW ───────────────────────────────────────────────────────────────────────────
    // Keyed on a property of the character card, not on the user's taste, because that is
    // what the prompt actually keys on (author's note: enable when the card already carries
    // NSFW content). 'no' matches the preset's shipped state.
    {
      id: "card-nsfw",
      description: "角色卡自带 NSFW → 💗NSFW（增强 2022 破甲）",
      when: { cardNsfw: "yes" },
      actions: [{ type: "setPromptEnabled", promptId: "nsfwBoost", enabled: true }]
    },
    // ── Writing style ──────────────────────────────────────────────────────────────────
    // Exactly one is on: the baseline turned all three off, and the answer turns one back on.
    {
      id: "style-visual-novel",
      description: "视觉小说 → ✒️文风：视觉小说",
      when: { style: "visualNovel" },
      actions: [{ type: "setPromptEnabled", promptId: "styleVisualNovel", enabled: true }]
    },
    {
      id: "style-light-novel",
      description: "轻小说 → ✒️文风：轻小说",
      when: { style: "lightNovel" },
      actions: [{ type: "setPromptEnabled", promptId: "styleLightNovel", enabled: true }]
    },
    {
      id: "style-strong-subjective",
      description: "强主观 → ✒️文风：强主观",
      when: { style: "strongSubjective" },
      actions: [{ type: "setPromptEnabled", promptId: "styleStrongSubjective", enabled: true }]
    },
    {
      // Enables the on-demand prompt and fills its body in the same pass. The prompt is
      // created only when this rule fires, so users on a built-in style never get it.
      id: "style-custom",
      description: "自己缝合 → ✒️文风：自定义 的 {{setvar::writingstyle}}",
      when: { style: "custom" },
      actions: [
        { type: "setPromptEnabled", promptId: "styleCustom", enabled: true },
        {
          type: "setPromptVariable",
          promptId: "styleCustom",
          variable: "writingstyle",
          value: { fromAnswer: "customStyleText" }
        }
      ]
    },
    // ── Free-text fields ───────────────────────────────────────────────────────────────
    // These rewrite a `{{setvar::…}}` value instead of toggling a prompt. Both prompts ship
    // enabled and stay enabled — nothing here touches their `enabled` flag.
    //
    // `fromAnswer` keeps the rule declarative: the engine substitutes whatever the user typed.
    {
      id: "plot-text",
      description: "剧情偏好输入框 → 🎞️剧情偏好（自填）的 {{setvar::plot}}",
      actions: [
        {
          type: "setPromptVariable",
          promptId: "plotPreference",
          variable: "plot",
          value: { fromAnswer: "plotText" }
        }
      ]
    },
    {
      id: "person-text",
      description: "人称设置输入框 → 🗃️人称设置（自改）的 {{setvar::rencheng}}",
      actions: [
        {
          type: "setPromptVariable",
          promptId: "personSetting",
          variable: "rencheng",
          value: { fromAnswer: "personText" }
        }
      ]
    },
    /*
     * ── 禁词表 ─────────────────────────────────────────────────────────────────────────
     * Additive: this writes ONLY the panel's own block inside 💠禁词表, never the author's
     * lines. Unconditional rather than gated on `hasText`, because an empty answer has to
     * reach `replaceAppended` — that is what removes a block added on a previous run. Gating
     * it would make added words impossible to take back out.
     *
     * The prompt's `enabled` flag is never touched: it ships on and carries the author's own
     * list, which must not disappear just because nobody typed anything.
     */
    {
      id: "banned-words",
      description: "禁词输入框 → 💠禁词表末尾追加（不覆盖原有内容）",
      actions: [
        {
          type: "setPromptVariable",
          promptId: "bannedWords",
          variable: "extra",
          value: { fromAnswer: "bannedWordsText" }
        }
      ]
    },
    // ── Custom NSFW body ───────────────────────────────────────────────────────────────
    // Overwrites the whole 💗NSFW prompt, so it is gated on BOTH the card answer and an
    // explicit opt-in. Choosing 用原本的 emits no action at all.
    {
      id: "nsfw-custom",
      description: "自己的 NSFW 提示词 → 覆盖 💗NSFW 的全部内容",
      when: { cardNsfw: "yes", nsfwSource: "custom" },
      actions: [
        {
          type: "setPromptVariable",
          promptId: "nsfwBoost",
          variable: "content",
          value: { fromAnswer: "nsfwText" }
        }
      ]
    },
    // ── Chain-of-thought viewer ────────────────────────────────────────────────────────
    // A preset-bound REGEX (extensions.regex_scripts), not a prompt. Shipped disabled.
    {
      id: "cot-viewer-off",
      description: "不看思维链 → 关闭 思维链折叠 正则",
      when: { showCot: "no" },
      actions: [{ type: "setRegexEnabled", regexId: "cotViewer", enabled: false }]
    },
    {
      id: "cot-viewer-on",
      description: "想看思维链 → 开启 思维链折叠 正则",
      when: { showCot: "yes" },
      actions: [{ type: "setRegexEnabled", regexId: "cotViewer", enabled: true }]
    },
    // ── User-supplied insertion points ─────────────────────────────────────────────────
    // Predicate conditions, because "on" here means "the user actually typed something".
    // An empty box leaves the prompt off, and since the baseline already turned it off, the
    // prompt is never created at all — that is what keeps these invisible to users who
    // ignore them.
    {
      id: "custom-stitch",
      description: "自定义缝合处 → 插在 💠</DATA> 之前",
      when: (answers) => hasText(answers["customStitchText"]),
      actions: [
        { type: "setPromptEnabled", promptId: "customStitch", enabled: true },
        {
          type: "setPromptVariable",
          promptId: "customStitch",
          variable: "content",
          value: { fromAnswer: "customStitchText" }
        }
      ]
    },
    {
      id: "custom-format-stitch",
      description: "自定义格式缝合处 → 插在 🔖摘要 之前",
      when: (answers) => hasText(answers["customFormatStitchText"]),
      actions: [
        { type: "setPromptEnabled", promptId: "customFormatStitch", enabled: true },
        {
          type: "setPromptVariable",
          promptId: "customFormatStitch",
          variable: "content",
          value: { fromAnswer: "customFormatStitchText" }
        }
      ]
    },
    // ── 💠火之晨曦 filler ───────────────────────────────────────────────────────────────
    // Gated on an explicit choice, because this one OVERWRITES ~11k characters of the
    // author's prose with no way back. Picking 用原本的 emits no action at all.
    {
      id: "fire-dawn-custom",
      description: "自己的小说 → 覆盖 💠火之晨曦 的全部内容",
      // Gated on the box having text rather than on a source choice: the choice is gone,
      // and an empty answer must still write nothing so a re-run cannot blank the prompt.
      when: (answers) => hasText(answers.fireDawnText),
      actions: [
        {
          type: "setPromptVariable",
          promptId: "fireDawn",
          variable: "novel",
          value: { fromAnswer: "fireDawnText" }
        }
      ]
    },
    // ── ⚙️SETTING content constraints ──────────────────────────────────────────────────
    // Literal spans inside a prompt that ships enabled and is never toggled.
    {
      id: "setting-language",
      description: "语言输入框 → ⚙️SETTING 的「正文语言：…」",
      actions: [
        {
          type: "setPromptVariable",
          promptId: "settingBlock",
          variable: "language",
          value: { fromAnswer: "languageText" }
        }
      ]
    },
    {
      id: "setting-word-count",
      description: "字数输入框 → ⚙️SETTING 的「不少于…字」",
      actions: [
        {
          type: "setPromptVariable",
          promptId: "settingBlock",
          variable: "wordCount",
          value: { fromAnswer: "wordCountText" }
        }
      ]
    },
    // ── Independent extras ─────────────────────────────────────────────────────────────
    // One rule per toggle, generated from the registry so the page and the rules cannot
    // drift apart. `extras` is a multi-select answer; an object condition matches a scalar
    // against an array answer by containment (see `valueMatches` in ConfigEngine).
    ...extraToggleKeys.map(
      (key) => ({
        id: `extra-${key}`,
        when: { extras: key },
        actions: [{ type: "setPromptEnabled", promptId: key, enabled: true }]
      })
    )
    // TODO(author): further mappings go here once the prompt/question relationships are
    // confirmed. See the candidate list at the bottom of `promptRegistry.ts`.
  ];
  const onboardingSteps$1 = [
    {
      type: "content",
      id: "intro",
      title: "欢迎使用",
      content: onboardingContent$1.introduction,
      notice: onboardingContent$1.introNotice,
      noticeTone: "danger"
    },
    {
      type: "content",
      id: "fire-dawn-guide",
      title: "第一件事：换掉那段小说",
      content: onboardingContent$1.fireDawnGuide,
      notice: onboardingContent$1.fireDawnNotice
    },
    {
      /*
       * MANDATORY, by the author's instruction (2026-08-29): 「我想强制换小说，老有人看不到」.
       *
       * There used to be a 用原本的 / 换成我自己的 choice in front of this, with 用原本的 as the
       * default. It is gone: a default that is also the wrong answer is exactly how people
       * skipped this page without noticing it existed.
       *
       * Consequence, deliberately accepted: 下一步 is unavailable until something is pasted, so
       * "click through everything" is no longer a complete path. 上一步 still works and the
       * panel can be closed and reopened, so nobody is trapped — they just cannot finish the
       * wizard without dealing with this.
       *
       * Replaces the ENTIRE body of 💠雪融雪降. Destructive by the author's instruction,
       * so the copy says so and the box starts empty rather than prefilled with 11k characters
       * nobody wants to scroll through.
       */
      type: "question",
      id: "fireDawnText",
      title: "粘贴你要用的小说",
      description: "这一步不能跳过。7000 token 是下限，宁超勿少——注意是 token 不是字数，下方计数器按 token 实时统计。替换后原本那段文本不会保留，需要的话请先自己备份一份。",
      help: "换什么都行，但有三件事要避开：一、不要用黄文。二、不要用别人也可能拿来换的段落——用的人一多就等于没换。三、想用的书如果太热门，大不了往后翻几百章，找一段冷一点的。另外：秒截断基本就是这一步没做好，先回来把这段换得更长、更冷门再说。",
      inputType: "textarea",
      placeholder: "粘贴一段你喜欢的小说……",
      requireAnswer: "请先粘贴你要用的小说，这一步不能跳过。",
      // Live token counter against the author's target. Tokens, not characters — see
      // `renderText` for why conflating the two would mislead.
      showLength: true,
      tokenTarget: 7e3
    },
    {
      type: "content",
      id: "environment",
      title: "开始之前",
      content: onboardingContent$1.environmentGuide
    },
    {
      /*
       * Selects between the two chain-of-thought variants shipped in the preset.
       *
       * Every word of both descriptions is the author's own characterisation, kept verbatim
       * across several rounds of correction — do not paraphrase, condense or "clarify" it.
       * Two corrections in particular are baked in here:
       *   · 三段 is not the truncation-prone one; 单段's 防截断 is simply stronger.
       *   · 破甲 is not one axis. 三段 is stronger against 本体甲, 单段 against 外审.
       * That second point is why neither option can be described as the stronger 破甲 choice.
       */
      type: "question",
      id: "tradeoff",
      title: "你更看重哪一种表现？",
      inputType: "single",
      defaultValue: "expressive",
      options: [
        {
          id: "expressive",
          label: "文笔与篇幅优先",
          description: "文笔好、出字多、推剧情快、NSFW 快；破本体甲强；但格式不稳。",
          recommended: true
        },
        {
          id: "stable",
          label: "稳定与可控优先",
          description: "格式稳、防截断能力强、破外审强；但 NSFW 节奏慢、出字少、文笔略差。"
        }
      ]
    },
    {
      type: "content",
      id: "jailbreak-guide",
      title: "关于破甲",
      content: onboardingContent$1.jailbreakGuide,
      notice: onboardingContent$1.jailbreakDisclaimer
    },
    {
      /*
       * The transport switch. Unlike every other answer here this one does NOT touch the
       * preset — it flips `antiTruncationEnabled` in the panel's own settings, which is what
       * arms the fetch interceptor. `Onboarding.applyAnswers` is where that happens.
       *
       * It sits in front of 防截断 on purpose: answering 用 hides that question entirely
       * (`showWhen` below), because the three prompt-based defences are alternatives to this,
       * not companions to it.
       *
       * TODO(author): the label/description wording is yours to set — these are placeholders
       * that describe only what the code does.
       */
      type: "question",
      id: "transport",
      title: "要用防截断传输吗？",
      help: "必须渠道支持函数调用才能用，不支持的渠道开了会空回。有这个就不需要其他防截断了，下一题会自动跳过。开启后，回复会通过一个合成函数的参数传回，再由面板还原成正文，正文不经过普通文本通道。流式和非流式都支持。面板发现渠道不支持时只会提示，不会替你关掉——随时可以在面板「状态」或聊天框上方的「🛡 防截断」按钮关掉。",
      inputType: "single",
      defaultValue: "on",
      options: [
        {
          id: "on",
          label: "用",
          description: "预设默认就是开的。开启后下一题（防截断）会自动跳过。"
        },
        {
          id: "off",
          label: "不用",
          description: "保持渠道原本的输出方式。"
        }
      ]
    },
    {
      // Deliberately phrased around a SYMPTOM the user can actually observe, not around what
      // the two prompts do internally — the panel has no ground truth for that.
      //
      // The symptom asked about is 空回 (an empty response) because that is what the author
      // specified. Do not "improve" it to 截断: an earlier draft asked about truncation and
      // was corrected.
      //
      // How 空回 relates to the 防截断 capability the CoT choice also affects is the author's
      // domain, not something to infer here — the panel states the symptom and the mapping,
      // nothing more.
      //
      // Default is 'none', matching the preset's shipped state (both defences off). The
      // author is explicit that switching one on when you do not need it is 反效果, so the
      // default must not be a defence.
      type: "question",
      id: "defense",
      title: "你遇到过空回吗？",
      // Hidden once the transport is on: these three are alternatives to it, and offering both
      // at once would invite turning on a defence the author calls 反效果 when unneeded.
      showWhen: { transport: "off" },
      help: "普通和牢大是互补关系，不是强弱之分——一个不管用就换另一个试试。防输出审查两者没有差别，普通的甚至可能更强；牢大的区别是能防某些渠道的输入审查。几个不会同时开启，所以你随时可以回到这里换一个。",
      inputType: "single",
      defaultValue: "none",
      options: [
        {
          id: "none",
          label: "没遇到过",
          description: "保持预设原样。没遇到就不要开，开了是反效果。",
          recommended: true
        },
        {
          id: "normal",
          label: "遇到过，先试普通防截断",
          description: "防输出审查不弱于牢大。",
          notRecommended: true
        },
        {
          id: "strong",
          label: "普通的不管用，换牢大防截断",
          description: "防输出审查和普通没有差别；区别是它能防某些渠道的输入审查。",
          notRecommended: true
        },
        {
          // Reserved slot: appears automatically once 📐防截断新 exists in the preset.
          id: "newer",
          label: "换防截断新",
          requiresPrompt: "defenseNew"
        }
      ]
    },
    {
      // Asks about a property of the CARD, not about the user's preference — that is what
      // the prompt actually keys on. Phrasing it as "你想要 NSFW 吗" would attach it to the
      // wrong thing and mis-configure anyone using a SFW card.
      type: "question",
      id: "cardNsfw",
      title: "你常用的角色卡本身带 NSFW 内容吗？",
      inputType: "single",
      defaultValue: "no",
      options: [
        {
          id: "no",
          label: "不带 / 不确定",
          description: "保持预设原样。卡本身不带 NSFW 时开了是反效果。",
          recommended: true
        },
        {
          id: "yes",
          label: "角色卡自带 NSFW",
          description: "开启后可增强 2022 破甲。遇到软道歉也开这个。"
        }
      ]
    },
    {
      // Only meaningful once NSFW is actually being enabled.
      type: "question",
      id: "nsfwSource",
      title: "NSFW 提示词",
      inputType: "single",
      defaultValue: "default",
      showWhen: { cardNsfw: "yes" },
      options: [
        { id: "default", label: "用原本的", recommended: true },
        { id: "custom", label: "换成我自己的" }
      ]
    },
    {
      // Replaces the ENTIRE body of 💗NSFW. Destructive, like 💠雪融雪降, so the copy says so
      // and the box starts empty rather than prefilled.
      type: "question",
      id: "nsfwText",
      title: "写下你的 NSFW 提示词",
      description: "替换后原本那段不会保留，需要的话请先自己备份一份。",
      inputType: "textarea",
      placeholder: "例如：\n<sex_style>\n……\n</sex_style>",
      // Both conditions, so flipping the card answer back to 不带 also hides this.
      showWhen: { cardNsfw: "yes", nsfwSource: "custom" }
    },
    {
      // No option descriptions, by the author's instruction. The labels are the preset's own
      // style names, so nothing here characterises what the three actually read like.
      type: "question",
      id: "style",
      title: "你喜欢哪种文风？",
      inputType: "single",
      defaultValue: "visualNovel",
      options: [
        // Marked as recommended because it is the style the preset ships enabled — not an
        // editorial judgement of our own.
        { id: "visualNovel", label: "视觉小说", recommended: true },
        { id: "lightNovel", label: "轻小说" },
        { id: "strongSubjective", label: "强主观" },
        { id: "custom", label: "我自己缝合文风" }
      ]
    },
    {
      // Only shown when 自己缝合 is picked. Writes {{setvar::writingstyle::…}} in a prompt the
      // panel creates next to the three shipped styles.
      type: "question",
      id: "customStyleText",
      title: "写下你的文风要求",
      description: "会作为文风指导直接发给模型，可以参考预设里三个内置文风的写法。",
      inputType: "textarea",
      placeholder: "例如：\n核心原则: ……\n  实践要点:\n    引语结构: ……",
      showWhen: { style: "custom" },
      // Seeded from the created prompt if it already exists, so re-running the wizard shows
      // what you wrote last time rather than a blank box.
      seedFromPromptVariable: { promptKey: "styleCustom", variable: "writingstyle" }
    },
    {
      // Writes {{setvar::plot::…}} in 🎞️剧情偏好（自填）.
      // The value is inlined mid-sentence by the CoT prompts
      // ("…你又该给出怎样的剧情走向{{getvar::plot}}，列出两者对比…"), hence the hint about
      // writing a phrase rather than a paragraph.
      type: "question",
      id: "plotText",
      title: "你有特别想要的剧情偏好吗？",
      description: "可以留空。这段文字会直接插进给模型的指令里，写成一句话或几个短语即可。",
      inputType: "textarea",
      placeholder: "例如：多一些日常互动，少一些战斗",
      // No defaultValue on purpose: the initial value comes from the preset via
      // `seedFromPromptVariable`. An absent answer means "leave the preset's text alone",
      // which is what protects the author's existing content if seeding ever fails.
      seedFromPromptVariable: { promptKey: "plotPreference", variable: "plot" }
    },
    {
      // Writes {{setvar::rencheng::…}} in 🗃️人称设置（自改）.
      // Shown prefilled with the preset's current text so the user edits an example rather
      // than inventing the format. The author's `{{// …}}` comment in that prompt is not
      // part of the macro value and is preserved untouched.
      type: "question",
      id: "personText",
      title: "人称设置",
      description: "默认是第三人称。要改成第一人称的话，照着现有格式改写即可。",
      help: "这段文字会作为一条指令直接发给模型。作者在预设里给的示例：第一人称就是「忽略<Interaction_history>，必须以第一人称创作正文，<user>=我」。",
      inputType: "textarea",
      // No defaultValue — see the note on plotText above. Especially important here: the
      // shipped value is the 第三人称 instruction, and defaulting to '' would erase it.
      seedFromPromptVariable: { promptKey: "personSetting", variable: "rencheng" }
    },
    {
      // Rewrites the literal `简体中文` in ⚙️SETTING's `- 正文语言：…` line.
      type: "question",
      id: "languageText",
      title: "正文用什么语言？",
      inputType: "text",
      placeholder: "简体中文",
      seedFromPromptVariable: { promptKey: "settingBlock", variable: "language" }
    },
    {
      // Rewrites the literal `1000` in ⚙️SETTING's `…一共不少于1000字`.
      type: "question",
      id: "wordCountText",
      title: "每次至少写多少字？",
      description: "这是给模型的下限要求，不是硬性上限。",
      inputType: "text",
      placeholder: "1000",
      seedFromPromptVariable: { promptKey: "settingBlock", variable: "wordCount" }
    },
    {
      /*
       * 💠禁词表 — the one field that ADDS instead of replacing.
       *
       * The author's four entries stay exactly where they are; whatever is typed here is added
       * below them in the same `- ` format, inside the same tag. Clearing the box removes the
       * addition and restores the prompt to the author's original, so this is fully reversible.
       *
       * Seeded from the panel's own block rather than from the whole list, so the box shows
       * what YOU added last time — not the author's four lines, which are not yours to edit
       * here and would be re-appended to themselves if they were.
       */
      type: "question",
      id: "bannedWordsText",
      title: "还有什么词不想看到？",
      description: "一行一个，会加到预设自带的禁词表后面，原本那几条不会动。留空就什么都不加。",
      inputType: "textarea",
      optional: true,
      placeholder: "支配\n掌控\n狂热",
      seedFromPromptVariable: { promptKey: "bannedWords", variable: "extra" }
    },
    {
      // Toggles the 思维链折叠 regex bound to the preset (extensions.regex_scripts), not a
      // prompt. Shipped disabled, so 'no' is the no-op default.
      type: "question",
      id: "showCot",
      title: "你想看预设的思维链吗？",
      inputType: "single",
      defaultValue: "no",
      options: [
        { id: "no", label: "不看", recommended: true },
        { id: "yes", label: "想看，折叠显示在回复里" }
      ]
    },
    {
      /*
       * 📘选项 — added by the author in v2.6 (2026-09-01), on its own page rather than as a row
       * on the extras multi-select, by request. Shipped off, so `false` is the no-op default.
       *
       * TODO(author): 填一句 `description`，说明开了之后回复里会多出什么。留空的话这一页就只有
       * 标题和开关——机制是通的，只是没有解释。
       */
      type: "question",
      id: "actionOptions",
      title: "行动选项",
      inputType: "toggle",
      defaultValue: false
    },
    {
      /*
       * 💬双语对白 — same shape, same release.
       *
       * TODO(author): 同上，填一句 `description`。
       */
      type: "question",
      id: "bilingualDialogue",
      title: "双语对白",
      inputType: "toggle",
      defaultValue: false
    },
    {
      /*
       * 💬内心戏 — same shape, same release.
       *
       * TODO(author): 同上，填一句 `description`。
       */
      type: "question",
      id: "innerMonologue",
      title: "内心戏",
      inputType: "toggle",
      defaultValue: false
    },
    {
      // Creates 💠自定义缝合处 immediately before 💠</DATA>, i.e. at the end of the data
      // block. Nothing is created while the box is empty.
      type: "question",
      id: "customStitchText",
      title: "自定义缝合处",
      description: "留空就不启用。填入的内容会插在数据块（</DATA>）之前。",
      inputType: "textarea",
      optional: true,
      seedFromPromptVariable: { promptKey: "customStitch", variable: "content" }
    },
    {
      // Creates 💠自定义格式缝合处 immediately before 🔖摘要, in the formatting region.
      type: "question",
      id: "customFormatStitchText",
      title: "自定义格式缝合处",
      description: "留空就不启用。填入的内容会插在摘要之前，用来补充格式要求。",
      inputType: "textarea",
      optional: true,
      seedFromPromptVariable: { promptKey: "customFormatStitch", variable: "content" }
    },
    {
      // One multi-select page for the independent extras. No option descriptions, by the
      // author's instruction; labels are the preset's own prompt names so a row here matches
      // the SillyTavern prompt manager one-for-one.
      //
      // Default is the preset's shipped state: only 🤖防机械化 is on.
      type: "question",
      id: "extras",
      title: "还要开启哪些条目？",
      inputType: "multi",
      defaultValue: ["antiMechanical"],
      options: [
        { id: "antiSycophancy", label: "⚓不媚USER" },
        { id: "antiDomination", label: "⚖️防支配" },
        { id: "antiOmniscience", label: "💡防全知" },
        { id: "dialogueBoost", label: "📣对话加强" },
        { id: "narrationBoost", label: "📢加強转述" },
        { id: "antiMechanical", label: "🤖防机械化" },
        { id: "interrupt", label: "💬抢话" },
        { id: "noInterrupt", label: "💬不抢话" },
        { id: "pronounControl", label: "🔍人称代词控制" }
      ]
    }
  ];
  const fireDawnProfile = {
    identity,
    launcherButtonName,
    transportButtonName,
    transportControlAnchor,
    configSchemaVersion,
    configurablePrompts: configurablePrompts$1,
    configurableRegexes: configurableRegexes$1,
    configurationRules: configurationRules$1,
    onboardingSteps: onboardingSteps$1,
    onboardingContent: onboardingContent$1,
    dashboardContent: dashboardContent$1
  };
  const profile = fireDawnProfile;
  const presetIdentity = profile.identity;
  const PANEL_VERSION = "0.2.5";
  const CONFIG_SCHEMA_VERSION = profile.configSchemaVersion;
  const LAUNCHER_BUTTON_NAME = profile.launcherButtonName;
  const TRANSPORT_BUTTON_NAME = profile.transportButtonName;
  const TRANSPORT_CONTROL_ANCHOR = profile.transportControlAnchor;
  const DEFAULT_CAPACITY = 100;
  function mirrorToConsole(level, message, detail) {
    try {
      const method = level === "error" ? console.error : level === "warn" ? console.warn : level === "debug" ? console.debug : console.info;
      if (typeof method !== "function") return;
      if (detail === void 0) {
        method.call(console, `[Kemini] ${message}`);
      } else {
        method.call(console, `[Kemini] ${message}`, detail);
      }
    } catch {
    }
  }
  class EventLog {
    constructor(capacity = DEFAULT_CAPACITY) {
      this.capacity = capacity;
    }
    entries = [];
    log(level, message, detail) {
      this.entries.push({
        timestamp: Date.now(),
        level,
        message,
        ...detail === void 0 ? {} : { detail }
      });
      while (this.entries.length > this.capacity) {
        this.entries.shift();
      }
      mirrorToConsole(level, message, detail);
    }
    debug(message, detail) {
      this.log("debug", message, detail);
    }
    info(message, detail) {
      this.log("info", message, detail);
    }
    warn(message, detail) {
      this.log("warn", message, detail);
    }
    error(message, detail) {
      this.log("error", message, detail);
    }
    list() {
      return this.entries;
    }
    clear() {
      this.entries.length = 0;
    }
    /** Human-readable rendering used by the "copy diagnostics" payload. */
    format(limit = this.capacity) {
      return this.entries.slice(-limit).map((entry) => {
        const time = new Date(entry.timestamp).toISOString().slice(11, 19);
        const level = entry.level === "info" ? "" : ` [${entry.level.toUpperCase()}]`;
        return `${time}${level} ${entry.message}`;
      }).join("\n");
    }
  }
  const eventLog = new EventLog();
  const HIGH_SURROGATE_START = 55296;
  const HIGH_SURROGATE_END = 56319;
  const LOW_SURROGATE_START = 56320;
  const LOW_SURROGATE_END = 57343;
  const MAX_KEY_SCAN = 500;
  class IncrementalContentDecoder {
    state = "init";
    keyScan = "";
    /** An escape sequence cut in half by a fragment boundary. */
    pendingEscape = "";
    /** A quote held back because we cannot yet tell if it closes the string. */
    pendingQuote = false;
    highSurrogate = 0;
    emittedAny = false;
    get hasEmitted() {
      return this.emittedAny;
    }
    get isComplete() {
      return this.state === "completed";
    }
    /** Feed one raw fragment; returns the text that is now safe to show. */
    feed(fragment) {
      if (!fragment) return "";
      let out = "";
      let source = fragment;
      if (this.pendingQuote) {
        this.pendingQuote = false;
        const rest = source.replace(/^[\s]*/, "");
        if (rest.startsWith("}") || rest === "") {
          this.state = "completed";
          return "";
        }
        out += '"';
      }
      if (this.pendingEscape) {
        source = this.pendingEscape + source;
        this.pendingEscape = "";
      }
      let i = 0;
      while (i < source.length) {
        const char = source[i];
        switch (this.state) {
          case "init":
            if (char === "{" || char === '"') {
              this.state = "lookingForKey";
              if (char === '"') this.keyScan = '"';
            }
            i += 1;
            break;
          case "lookingForKey":
            this.keyScan += char;
            i += 1;
            if (this.keyScan.includes('"content"')) {
              this.state = "lookingForColon";
              this.keyScan = "";
            } else if (this.keyScan.length > MAX_KEY_SCAN) {
              this.state = "error";
            }
            break;
          case "lookingForColon":
            if (char === ":") this.state = "lookingForQuote";
            i += 1;
            break;
          case "lookingForQuote":
            if (char === '"') {
              this.state = "inString";
            } else if (!/\s/.test(char)) {
              this.state = "error";
            }
            i += 1;
            break;
          case "inString": {
            const consumed = this.consumeStringChar(source, i);
            out += consumed.text;
            if (consumed.stop) {
              i = source.length;
            } else {
              i += consumed.width;
            }
            break;
          }
          case "completed": {
            const rest = source.slice(i).trim();
            if (rest !== "" && rest !== "}" && rest !== "},") {
              this.state = "inString";
              break;
            }
            i = source.length;
            break;
          }
          case "error":
            i = source.length;
            break;
        }
      }
      if (out) this.emittedAny = true;
      return out;
    }
    /**
     * Consume one logical character of the JSON string starting at `index`.
     *
     * `stop` means the rest of this fragment must not be processed — either the string ended
     * or an incomplete tail was stashed for the next fragment.
     */
    consumeStringChar(source, index) {
      const char = source[index];
      if (char === "\\") {
        const next = source[index + 1];
        if (next === void 0) {
          this.pendingEscape = "\\";
          return { text: "", width: 0, stop: true };
        }
        if (next === "u") {
          const hex = source.slice(index + 2, index + 6);
          if (hex.length < 4) {
            this.pendingEscape = source.slice(index);
            return { text: "", width: 0, stop: true };
          }
          const code = Number.parseInt(hex, 16);
          if (Number.isNaN(code)) {
            return { text: `\\u${hex}`, width: 6, stop: false };
          }
          if (code >= HIGH_SURROGATE_START && code <= HIGH_SURROGATE_END) {
            this.highSurrogate = code;
            return { text: "", width: 6, stop: false };
          }
          if (code >= LOW_SURROGATE_START && code <= LOW_SURROGATE_END && this.highSurrogate) {
            const combined = 65536 + (this.highSurrogate - HIGH_SURROGATE_START << 10) + (code - LOW_SURROGATE_START);
            this.highSurrogate = 0;
            return { text: String.fromCodePoint(combined), width: 6, stop: false };
          }
          return { text: String.fromCharCode(code), width: 6, stop: false };
        }
        const simple = SIMPLE_ESCAPES[next];
        if (simple !== void 0) {
          return { text: simple, width: 2, stop: false };
        }
        return { text: char + next, width: 2, stop: false };
      }
      if (char === '"') {
        const rest = source.slice(index + 1);
        if (rest === "") {
          this.pendingQuote = true;
          return { text: "", width: 0, stop: true };
        }
        if (rest.replace(/^[\s]*/, "").startsWith("}")) {
          this.state = "completed";
          return { text: "", width: 0, stop: true };
        }
        return { text: '"', width: 1, stop: false };
      }
      return { text: char, width: 1, stop: false };
    }
    /**
     * Flush whatever is still held back once the stream is over.
     *
     * A dangling escape is emitted verbatim: showing the user a stray backslash is better
     * than silently dropping characters they paid for.
     */
    finish() {
      let out = "";
      if (this.pendingQuote && !this.emittedAny) {
        out += '"';
      }
      this.pendingQuote = false;
      if (this.pendingEscape) {
        out += this.pendingEscape;
        this.pendingEscape = "";
      }
      if (out) this.emittedAny = true;
      return out;
    }
  }
  const SIMPLE_ESCAPES = {
    '"': '"',
    "\\": "\\",
    "/": "/",
    b: "\b",
    f: "\f",
    n: "\n",
    r: "\r",
    t: "	"
  };
  class JsonArrayStreamSplitter {
    buffer = "";
    /** How far into `buffer` the scan has already reached. */
    at = 0;
    /** Offset where the element currently being scanned began. */
    start = 0;
    depth = 0;
    inElement = false;
    inString = false;
    escaped = false;
    opened = false;
    closed = false;
    /** True once the closing `]` arrived, i.e. the array was complete rather than cut off. */
    get complete() {
      return this.closed;
    }
    /** Feed raw text; returns every top-level element that is now whole. */
    push(text) {
      if (!text) return [];
      this.buffer += text;
      const elements = [];
      while (this.at < this.buffer.length) {
        const char = this.buffer[this.at];
        if (this.closed) {
          this.at += 1;
          continue;
        }
        if (!this.inElement) {
          if (!this.opened) {
            if (char === "[") {
              this.opened = true;
              this.at += 1;
              continue;
            }
            if (isSpace(char)) {
              this.at += 1;
              continue;
            }
            this.opened = true;
            continue;
          }
          if (isSpace(char) || char === ",") {
            this.at += 1;
            continue;
          }
          if (char === "]") {
            this.closed = true;
            this.at += 1;
            continue;
          }
          this.inElement = true;
          this.start = this.at;
          this.depth = 0;
        }
        if (this.inString) {
          if (this.escaped) this.escaped = false;
          else if (char === "\\") this.escaped = true;
          else if (char === '"') this.inString = false;
        } else if (char === '"') {
          this.inString = true;
        } else if (char === "{" || char === "[") {
          this.depth += 1;
        } else if (char === "}" || char === "]") {
          this.depth -= 1;
          if (this.depth === 0) {
            elements.push(this.buffer.slice(this.start, this.at + 1));
            this.inElement = false;
            this.buffer = this.buffer.slice(this.at + 1);
            this.at = 0;
            continue;
          }
        }
        this.at += 1;
      }
      return elements;
    }
    /**
     * Whatever never formed a complete element.
     *
     * Emitted rather than dropped on a truncated stream: the characters arrived and were paid
     * for, and a half-object downstream is more honest than silence.
     */
    finish() {
      if (!this.inElement) return "";
      const rest = this.buffer.slice(this.start);
      this.inElement = false;
      this.buffer = "";
      this.at = 0;
      return rest;
    }
  }
  function isSpace(char) {
    return char === " " || char === "\n" || char === "\r" || char === "	";
  }
  function flattenJsonElement(element) {
    try {
      return JSON.stringify(JSON.parse(element));
    } catch {
      return element.replace(/[\r\n]+/g, " ");
    }
  }
  const TOOL_PREFIX = "emit_complete_response_";
  function matchesToolName(candidate, toolName) {
    if (typeof candidate !== "string" || !candidate || !toolName) return false;
    if (candidate === toolName) return true;
    return bareToolName(candidate) === toolName;
  }
  function bareToolName(candidate) {
    return candidate.slice(candidate.lastIndexOf(":") + 1);
  }
  const NO_CLIENT_TOOLS = /* @__PURE__ */ new Set();
  function classifyToolName(candidate, toolName, clientToolNames = NO_CLIENT_TOOLS) {
    if (typeof candidate !== "string" || !candidate) return "client";
    if (matchesToolName(candidate, toolName)) return "own";
    const bare = bareToolName(candidate);
    if (clientToolNames.has(candidate) || clientToolNames.has(bare)) return "client";
    return bare.length > TOOL_PREFIX.length && bare.startsWith(TOOL_PREFIX) ? "foreign" : "client";
  }
  function randomToolName(existing) {
    for (let attempt2 = 0; attempt2 < 100; attempt2 += 1) {
      const bytes = new Uint8Array(12);
      crypto.getRandomValues(bytes);
      const name = TOOL_PREFIX + Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
      if (!existing.has(name)) return name;
    }
    throw new Error("could not generate a unique transport tool name");
  }
  function collectToolNames(tools) {
    const names = /* @__PURE__ */ new Set();
    if (!Array.isArray(tools)) return names;
    for (const tool of tools) {
      const name = tool?.function?.name;
      if (typeof name === "string" && name) names.add(name);
    }
    return names;
  }
  function callerControlsTools(body) {
    const choice = body["tool_choice"];
    if (choice === "none") return "tools-disabled-by-caller";
    if (choice === "required") return "caller-forced-tool";
    if (choice && typeof choice === "object") return "caller-forced-tool";
    return void 0;
  }
  function buildToolDefinition(name) {
    return {
      type: "function",
      function: {
        name,
        description: "Emit the complete final user-visible reply exactly once. Put the entire reply in content and write no reply text outside this call.",
        parameters: {
          type: "object",
          properties: {
            content: {
              type: "string",
              description: "The complete final reply shown to the user."
            }
          },
          required: ["content"]
        }
      }
    };
  }
  function buildControlPrompt(toolName) {
    return `Call the \`${toolName}\` function exactly once and put your complete final reply in its \`content\` argument. Do not write any of the final reply outside that call. Use any other available tools normally when they are needed.`;
  }
  function findAnchor(messages, anchor) {
    for (let index = 0; index < messages.length; index += 1) {
      const content = messages[index]?.content;
      if (typeof content === "string" && content.includes(anchor)) return index;
    }
    return -1;
  }
  function prepareRequest(rawBody, options = {}) {
    let body;
    try {
      const parsed = JSON.parse(rawBody);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return { kind: "bypass", reason: "unparseable" };
      }
      body = parsed;
    } catch {
      return { kind: "bypass", reason: "unparseable" };
    }
    const messages = body["messages"];
    if (!Array.isArray(messages) || messages.length === 0) {
      return { kind: "bypass", reason: "no-messages" };
    }
    const controlled = callerControlsTools(body);
    if (controlled) {
      return { kind: "bypass", reason: controlled };
    }
    const existingTools = Array.isArray(body["tools"]) ? [...body["tools"]] : [];
    const clientToolNames = collectToolNames(existingTools);
    const toolName = randomToolName(clientToolNames);
    body["tools"] = [...existingTools, buildToolDefinition(toolName)];
    body["tool_choice"] = "auto";
    const control = buildControlPrompt(toolName);
    const anchorIndex = options.controlAnchor ? findAnchor(messages, options.controlAnchor) : -1;
    let controlPlacement;
    if (anchorIndex >= 0) {
      body["messages"] = [
        ...messages.slice(0, anchorIndex),
        { role: "system", content: control },
        ...messages.slice(anchorIndex)
      ];
      controlPlacement = "anchored";
    } else {
      const lastRole = messages[messages.length - 1]?.role;
      const controlRole = lastRole === "assistant" ? "user" : "system";
      body["messages"] = [...messages, { role: controlRole, content: control }];
      controlPlacement = "appended";
    }
    return {
      kind: "prepared",
      prepared: {
        body: JSON.stringify(body),
        toolName,
        clientToolNames,
        streamRequested: body["stream"] === true,
        controlPlacement
      }
    };
  }
  class SseContentRewriter {
    constructor(toolName, clientToolNames = /* @__PURE__ */ new Set()) {
      this.toolName = toolName;
      this.clientToolNames = clientToolNames;
    }
    states = /* @__PURE__ */ new Map();
    stats = {
      syntheticSeen: false,
      contentConflict: false,
      plainWon: false,
      sawDone: false,
      decodedChars: 0,
      emittedChars: 0,
      decodedChunks: 0
    };
    /** Echoed back on a synthesized final chunk so it matches the rest of the stream. */
    lastChunkMeta = {
      id: "chatcmpl-anti-truncation",
      model: "unknown",
      created: Math.floor(Date.now() / 1e3)
    };
    state(index, dialect) {
      let existing = this.states.get(index);
      if (!existing) {
        existing = {
          dialect,
          plain: "",
          sent: "",
          channels: /* @__PURE__ */ new Map(),
          slotNames: /* @__PURE__ */ new Map(),
          activeGoogleChannel: void 0,
          sawSynthetic: false
        };
        this.states.set(index, existing);
      }
      existing.dialect = dialect;
      return existing;
    }
    /**
     * Transform one SSE `data:` payload.
     *
     * Returns the replacement payload, or `undefined` when the chunk carried nothing left to
     * forward (for example a tool-call fragment that decoded to no visible characters yet).
     */
    transformPayload(payload) {
      const trimmed = payload.trim();
      if (trimmed === "[DONE]") {
        this.stats.sawDone = true;
        return payload;
      }
      let chunk;
      try {
        const parsed = JSON.parse(trimmed);
        if (!parsed || typeof parsed !== "object") return payload;
        chunk = parsed;
      } catch {
        return payload;
      }
      if (typeof chunk["id"] === "string") this.lastChunkMeta.id = chunk["id"];
      if (typeof chunk["model"] === "string") this.lastChunkMeta.model = chunk["model"];
      if (typeof chunk["created"] === "number") this.lastChunkMeta.created = chunk["created"];
      const choices = chunk["choices"];
      if (Array.isArray(choices)) return this.rewriteChoices(chunk, choices, payload);
      const candidates = chunk["candidates"];
      if (Array.isArray(candidates)) return this.rewriteCandidates(chunk, candidates, payload);
      return payload;
    }
    /** The OpenAI dialect: `choices[].delta.tool_calls[].function.arguments`. */
    rewriteChoices(chunk, choices, payload) {
      let touched = false;
      let anythingToSend = false;
      for (const rawChoice of choices) {
        if (!rawChoice || typeof rawChoice !== "object") continue;
        const choice = rawChoice;
        const index = typeof choice["index"] === "number" ? choice["index"] : 0;
        const state = this.state(index, "openai");
        const field = choice["delta"] === void 0 || choice["delta"] === null ? choice["message"] && typeof choice["message"] === "object" ? "message" : "delta" : "delta";
        const delta = choice[field] ?? {};
        const originalContent = typeof delta["content"] === "string" ? delta["content"] : "";
        let streamedText = "";
        const toolCalls = delta["tool_calls"];
        if (Array.isArray(toolCalls)) {
          const { handled, decoded, remaining } = this.consumeToolCalls(state, toolCalls);
          streamedText += decoded;
          if (handled) touched = true;
          if (remaining.length > 0) {
            delta["tool_calls"] = remaining;
            anythingToSend = true;
          } else if (toolCalls.length > 0 && handled) {
            delete delta["tool_calls"];
            touched = true;
          }
        }
        if (originalContent) {
          touched = true;
          delete delta["content"];
          state.plain += originalContent;
        }
        if (streamedText) {
          delta["content"] = streamedText;
          anythingToSend = true;
        }
        const finish = choice["finish_reason"];
        if (finish !== null && finish !== void 0) {
          touched = true;
          anythingToSend = true;
          const tail = this.finalizeChoice(state);
          if (tail) {
            delta["content"] = (delta["content"] ?? "") + tail;
          }
          if (state.sawSynthetic && finish === "tool_calls") {
            choice["finish_reason"] = "stop";
          }
        }
        if (Object.keys(delta).length > 0) anythingToSend = true;
        choice[field] = delta;
      }
      if (!touched) return payload;
      if (!anythingToSend) return void 0;
      return JSON.stringify(chunk);
    }
    /**
     * The Google dialect: `candidates[].content.parts[].functionCall.args`.
     *
     * The recovered reply is emitted as a `parts[]` text entry, and it must come FIRST.
     * SillyTavern reads a Gemini chunk as `parts.filter(p => !p.thought).map(p => p.text)[0]`
     * (`public/scripts/openai.js`, `getStreamingReply`), so any other non-thought part left in
     * front of ours — an `inlineData` image, say — would shadow it and the reply would vanish.
     */
    rewriteCandidates(chunk, candidates, payload) {
      let touched = false;
      let anythingToSend = false;
      for (const rawCandidate of candidates) {
        if (!rawCandidate || typeof rawCandidate !== "object") continue;
        const candidate = rawCandidate;
        const index = typeof candidate["index"] === "number" ? candidate["index"] : 0;
        const state = this.state(index, "google");
        const rawContent = candidate["content"];
        const content = rawContent && typeof rawContent === "object" ? rawContent : {};
        const parts = content["parts"];
        let streamedText = "";
        const kept = [];
        if (Array.isArray(parts)) {
          for (const rawPart of parts) {
            if (!rawPart || typeof rawPart !== "object") {
              kept.push(rawPart);
              continue;
            }
            const part = rawPart;
            const call = part["functionCall"];
            if (call && typeof call === "object") {
              const consumed = this.consumeGoogleCall(state, call);
              if (!consumed.handled) {
                kept.push(rawPart);
                continue;
              }
              streamedText += consumed.decoded;
              touched = true;
              continue;
            }
            if (part["thought"] === true) {
              kept.push(rawPart);
              continue;
            }
            if (typeof part["text"] === "string" && part["text"]) {
              touched = true;
              state.plain += part["text"];
              continue;
            }
            kept.push(rawPart);
          }
        }
        let emitted = streamedText;
        const finish = candidate["finishReason"];
        if (finish !== null && finish !== void 0) {
          touched = true;
          anythingToSend = true;
          emitted += this.finalizeChoice(state);
        }
        if (!touched) continue;
        const nextParts = [];
        if (emitted) nextParts.push({ text: emitted });
        nextParts.push(...kept);
        if (nextParts.length > 0 || Array.isArray(parts)) {
          content["parts"] = nextParts;
          if (typeof content["role"] !== "string") content["role"] = "model";
          candidate["content"] = content;
        }
        if (nextParts.length > 0) anythingToSend = true;
      }
      if (!touched) return payload;
      if (!anythingToSend) return void 0;
      return JSON.stringify(chunk);
    }
    /**
     * Consume one Google `functionCall` block, in either of the two shapes it arrives in.
     *
     * ── Atomic ───────────────────────────────────────────────────────────────────────────
     * `{ name, args }` — the whole call in one block. What Gemini sends by default.
     *
     * ── Streamed (`streamFunctionCallArguments: true`) ───────────────────────────────────
     * The call is spread over several blocks and only the FIRST carries the name:
     *
     *   `{ name, id, willContinue: true }`                       ← opening, no arguments yet
     *   `{ partialArgs: [{ jsonPath: "$.content", stringValue }], willContinue: true }`
     *   `{ partialArgs: [{ jsonPath: "$.content" }] }`           ← end-of-argument marker
     *   `{}`                                                     ← end-of-call marker
     *
     * Every block after the first is anonymous, so `classifyToolName` cannot be asked again —
     * hence the latch. Without it those blocks read as somebody else's tool call and get
     * forwarded to a SillyTavern that finds no text in them: an empty message, with the whole
     * reply sitting in the fragments we just passed along.
     *
     * `stringValue` is DECODED text, not JSON source, so it must never reach
     * `IncrementalContentDecoder` — that one exists to read a raw `{"content":"…"}` string
     * while it is still arriving, which is a different problem.
     *
     * Malformed fragments are skipped rather than thrown on. The gateway-side reference
     * implementation throws; this one sits in front of a user's chat and must never turn a
     * degraded reply into a failed generation.
     */
    consumeGoogleCall(state, call) {
      const name = call["name"];
      let channelName;
      if (typeof name === "string" && name) {
        if (classifyToolName(name, this.toolName, this.clientToolNames) === "client") {
          state.activeGoogleChannel = void 0;
          return { handled: false, decoded: "" };
        }
        channelName = bareToolName(name);
        state.activeGoogleChannel = channelName;
      } else {
        channelName = state.activeGoogleChannel;
      }
      if (channelName === void 0) {
        const empty = call["args"] === void 0 && call["partialArgs"] === void 0 && state.sawSynthetic;
        return { handled: empty, decoded: "" };
      }
      this.markSynthetic(state);
      const channel = this.channel(state, channelName);
      let text = "";
      const partialArgs = call["partialArgs"];
      if (Array.isArray(partialArgs)) {
        text += readPartialArgs(partialArgs);
      }
      if (call["args"] !== void 0) {
        text += decodeGoogleArgs(channel, call["args"]);
      }
      if (call["willContinue"] !== true) {
        state.activeGoogleChannel = void 0;
      }
      return { handled: true, decoded: this.absorb(state, channel, text) };
    }
    /** First sight of a transport tool on this choice. */
    markSynthetic(state) {
      if (state.sawSynthetic) return;
      state.sawSynthetic = true;
      this.stats.syntheticSeen = true;
    }
    channel(state, name) {
      let channel = state.channels.get(name);
      if (!channel) {
        channel = { decoder: new IncrementalContentDecoder(), text: "" };
        state.channels.set(name, channel);
      }
      return channel;
    }
    /**
     * Record newly decoded transport text, and return the part that may go out right now.
     *
     * While a transport call is the only thing that has produced anything, its text streams as
     * it arrives — that progressive display is the whole point of the feature. The moment a
     * SECOND candidate exists (ordinary text the model wrote anyway, or another transport tool
     * because a gateway injected its own), streaming stops for this choice and the decision is
     * deferred to `finalizeChoice`, which sends the winner exactly once. Deferring costs the
     * progressive display only in the case that used to lose the reply outright.
     */
    absorb(state, channel, text) {
      if (!text) return "";
      channel.text += text;
      this.stats.decodedChunks += 1;
      if (state.plain !== "" || state.channels.size > 1) return "";
      state.sent += text;
      this.stats.decodedChars += text.length;
      this.stats.emittedChars += text.length;
      return text;
    }
    /**
     * Split a `tool_calls` delta into decoded transport text and the genuine calls that must
     * still be forwarded.
     */
    consumeToolCalls(state, toolCalls) {
      let handled = false;
      let decoded = "";
      const remaining = [];
      for (const rawCall of toolCalls) {
        if (!rawCall || typeof rawCall !== "object") {
          remaining.push(rawCall);
          continue;
        }
        const call = rawCall;
        const callIndex = typeof call["index"] === "number" ? call["index"] : 0;
        const fn = call["function"] ?? {};
        const name = typeof fn["name"] === "string" ? fn["name"] : "";
        let channelName = state.slotNames.get(callIndex);
        if (name) {
          const origin = classifyToolName(name, this.toolName, this.clientToolNames);
          if (origin === "client") {
            channelName = void 0;
            state.slotNames.delete(callIndex);
          } else {
            channelName = bareToolName(name);
            state.slotNames.set(callIndex, channelName);
          }
        }
        if (channelName === void 0) {
          remaining.push(rawCall);
          continue;
        }
        handled = true;
        this.markSynthetic(state);
        const channel = this.channel(state, channelName);
        const args = fn["arguments"];
        if (typeof args === "string" && args) {
          decoded += this.absorb(state, channel, channel.decoder.feed(args));
        }
      }
      return { handled, decoded, remaining };
    }
    /**
     * Decide which channel actually carried the reply, and return what still has to be sent.
     *
     * Longest wins, with a tie going to the transport call because that is the channel we
     * asked for. Anything already on screen cannot be recalled, so only the missing remainder
     * is emitted; a winner that is not a continuation of it is emitted whole, on the grounds
     * that showing a fragment twice beats not showing the reply at all.
     *
     * Idempotent: every accumulator is drained, so a second call (the `finish_reason` chunk
     * followed by the stream closing) adds nothing.
     */
    finalizeChoice(state) {
      let best = "";
      let bestIsPlain = false;
      let contenders = 0;
      for (const channel of state.channels.values()) {
        channel.text += channel.decoder.finish();
        if (channel.text) contenders += 1;
        if (channel.text.length > best.length) {
          best = channel.text;
          bestIsPlain = false;
        }
        channel.text = "";
      }
      if (state.plain) {
        contenders += 1;
        if (state.plain.length > best.length) {
          best = state.plain;
          bestIsPlain = true;
        }
      }
      state.plain = "";
      if (contenders > 1) {
        this.stats.contentConflict = true;
        if (bestIsPlain) this.stats.plainWon = true;
      }
      const tail = best.startsWith(state.sent) ? best.slice(state.sent.length) : best;
      state.sent += tail;
      this.stats.emittedChars += tail.length;
      if (!bestIsPlain) this.stats.decodedChars += tail.length;
      return tail;
    }
    /**
     * Release anything still held back, for a stream that ended without a `finish_reason`.
     *
     * Text is buffered until the winning channel is known, so a stream that simply stops — no
     * finish chunk, connection dropped, provider quirk — would otherwise take the entire reply
     * down with it. Returns one payload per choice that still owes the client text; the caller
     * writes them out before closing.
     */
    finalizePending() {
      const { id, model, created } = this.lastChunkMeta;
      const payloads = [];
      for (const [index, state] of this.states) {
        const pending = this.finalizeChoice(state);
        if (!pending) continue;
        payloads.push(
          state.dialect === "google" ? JSON.stringify({
            candidates: [
              { index, content: { role: "model", parts: [{ text: pending }] } }
            ]
          }) : JSON.stringify({
            id,
            object: "chat.completion.chunk",
            created,
            model,
            choices: [{ index, delta: { content: pending }, finish_reason: null }]
          })
        );
      }
      return payloads;
    }
  }
  function readPartialArgs(partialArgs) {
    let text = "";
    for (const rawFragment of partialArgs) {
      if (!rawFragment || typeof rawFragment !== "object") continue;
      const fragment = rawFragment;
      const path = typeof fragment["jsonPath"] === "string" ? fragment["jsonPath"].trim() : "";
      if (path !== "$.content") continue;
      const value = fragment["stringValue"];
      if (typeof value === "string") text += value;
    }
    return text;
  }
  function decodeGoogleArgs(channel, args) {
    if (typeof args === "string") return args ? channel.decoder.feed(args) : "";
    if (args && typeof args === "object") {
      const content = args["content"];
      if (typeof content !== "string" || !content) return "";
      if (!channel.text) return content;
      if (content.startsWith(channel.text)) return content.slice(channel.text.length);
      if (channel.text.startsWith(content)) return "";
      return content;
    }
    return "";
  }
  const MARKER$1 = "__keminiAntiTruncation__";
  const SOFT_MISS_LIMIT = 3;
  let onTransportIncompatible = () => {
  };
  function setTransportIncompatibleHandler(handler) {
    onTransportIncompatible = handler;
  }
  const GENERATION_ENDPOINT$1 = /\/api\/backends\/[^/]+\/generate\b/;
  class AntiTruncationInterceptor {
    installed = false;
    enabled = false;
    original;
    target;
    lastRunRecord;
    get isEnabled() {
      return this.enabled;
    }
    get lastRun() {
      return this.lastRunRecord;
    }
    /** Consecutive runs where the channel gave nothing back through the tool. */
    missStreak = 0;
    record(run) {
      this.lastRunRecord = { at: Date.now(), ...run };
      eventLog.info(
        `anti-truncation: ${run.outcome}` + (run.detail ? ` (${run.detail})` : "") + (run.outcome !== "transported" ? "" : run.plainWon ? ` — plain channel won with ${run.emittedChars} chars` : ` — ${run.decodedChars} chars in ${run.decodedChunks} chunks`)
      );
      this.warnIfChannelRejectsTransport(run.outcome, run.detail);
      this.warnIfChannelHasItsOwnTransport(run.outcome, run.plainWon);
    }
    /** Consecutive runs the ordinary text channel won. */
    plainWinStreak = 0;
    /**
     * Say when a channel looks like it is already doing this itself.
     *
     * Two anti-truncation layers are not harmful — the longest-wins rule keeps the reply — but
     * they are redundant, and the layer we add costs a control prompt and a tool the model has
     * to reason about. Worth telling the user; not worth deciding for them.
     */
    warnIfChannelHasItsOwnTransport(outcome, plainWon) {
      if (outcome !== "transported") return;
      if (!plainWon) {
        this.plainWinStreak = 0;
        return;
      }
      this.plainWinStreak += 1;
      if (this.plainWinStreak === SOFT_MISS_LIMIT) {
        onTransportIncompatible(
          `连续 ${SOFT_MISS_LIMIT} 次正文都是从普通通道拿到的，这条渠道多半自己就做了抗截断。正文没有丢，但本面板这一层是多余的，可以点「🛡 防截断」把它关掉。`
        );
      }
    }
    /**
     * Say when a channel looks unable to carry the transport — and do nothing else.
     *
     * Auto-disabling was considered and rejected: a model can decline the tool once for its
     * own reasons, and a panel that silently reverses the user's switch is worse than one that
     * keeps failing visibly. So this only warns, once per streak, and the user decides.
     *
     * `upstream-error` is a hard rejection and worth saying immediately. `no-synthetic-call`
     * and a barren `non-stream` are soft: they need to repeat before they mean anything.
     */
    warnIfChannelRejectsTransport(outcome, detail) {
      if (outcome === "transported" || outcome === "bypassed") {
        this.missStreak = 0;
        return;
      }
      if (outcome === "upstream-error") {
        this.missStreak = 0;
        onTransportIncompatible(
          `上游拒绝了这次请求（${detail ?? "未知"}）。如果每次都这样，多半是这条渠道不接受函数调用，可以点「🛡 防截断」把它关掉。`
        );
        return;
      }
      this.missStreak += 1;
      if (this.missStreak === SOFT_MISS_LIMIT) {
        onTransportIncompatible(
          `连续 ${SOFT_MISS_LIMIT} 次没有从传输函数里拿到正文，这条渠道可能不支持。开关没有被动过——要关请点「🛡 防截断」。`
        );
      }
    }
    setEnabled(enabled) {
      this.enabled = enabled;
      eventLog.info(`anti-truncation transport ${enabled ? "enabled" : "disabled"}`);
    }
    install() {
      if (this.installed) return;
      let target;
      try {
        target = window.parent ?? window;
        void target.fetch;
      } catch {
        eventLog.warn("anti-truncation: parent window unreachable, not installed");
        return;
      }
      const current = target.fetch;
      if (typeof current !== "function") return;
      const original = current[MARKER$1]?.original ?? current;
      const self = this;
      const wrapper = function patchedFetch(...args) {
        if (!self.enabled) {
          return original.apply(this ?? target, args);
        }
        try {
          const url = resolveUrl$1(args[0]);
          if (url && GENERATION_ENDPOINT$1.test(url)) {
            return self.intercept(original, this ?? target, args);
          }
        } catch (error) {
          eventLog.warn(`anti-truncation: intercept skipped, ${describeError$1(error)}`);
        }
        return original.apply(this ?? target, args);
      };
      wrapper[MARKER$1] = { original };
      target.fetch = wrapper;
      this.original = original;
      this.target = target;
      this.installed = true;
      eventLog.info("anti-truncation interceptor installed");
    }
    async intercept(original, thisArg, args) {
      const call = () => original.apply(thisArg, args);
      let rawBody;
      try {
        rawBody = await readRequestBody(args);
      } catch (error) {
        this.record({
          ...EMPTY_RUN,
          outcome: "bypassed",
          detail: `读取请求体失败: ${describeError$1(error)}`
        });
        return call();
      }
      if (rawBody === void 0) {
        this.record({ ...EMPTY_RUN, outcome: "bypassed", detail: "请求体不是可读取的字符串" });
        return call();
      }
      const result = prepareRequest(rawBody, { controlAnchor: TRANSPORT_CONTROL_ANCHOR });
      if (result.kind === "bypass") {
        this.record({ ...EMPTY_RUN, outcome: "bypassed", detail: result.reason });
        return call();
      }
      const { body, toolName, clientToolNames, streamRequested, controlPlacement } = result.prepared;
      if (controlPlacement === "appended") {
        eventLog.warn(
          `anti-truncation: control anchor ${JSON.stringify(TRANSPORT_CONTROL_ANCHOR)} not found, control prompt appended at the end instead`
        );
      }
      const patched = withBody(args, body);
      const response = await original.apply(thisArg, patched);
      if (!response.ok || !response.body) {
        this.record({
          ...EMPTY_RUN,
          outcome: "upstream-error",
          detail: `HTTP ${response.status}`
        });
        return response;
      }
      const contentType = response.headers.get("content-type") ?? "";
      const { shape, response: sniffed } = await sniffResponseShape(response, contentType);
      if (shape === "json-array" && streamRequested) {
        eventLog.info("anti-truncation: upstream sent a JSON array instead of SSE, reframing");
        return rewriteEventStream(reframeJsonArrayStream(sniffed), toolName, clientToolNames, (stats) => {
          this.record({
            outcome: stats.syntheticSeen ? "transported" : "no-synthetic-call",
            detail: "上游回的是 JSON 数组流，已转成 SSE",
            decodedChars: stats.decodedChars,
            emittedChars: stats.emittedChars,
            decodedChunks: stats.decodedChunks,
            streamed: stats.decodedChunks > 1,
            endedCleanly: stats.sawDone,
            conflict: stats.contentConflict,
            plainWon: stats.plainWon
          });
        });
      }
      if (shape !== "sse") {
        const { response: rewritten, recovered } = await rewriteJsonResponse(
          sniffed,
          toolName,
          clientToolNames
        );
        if (recovered !== void 0) {
          this.record({
            ...EMPTY_RUN,
            outcome: "transported",
            decodedChars: recovered.plainWon ? 0 : recovered.chars,
            emittedChars: recovered.chars,
            decodedChunks: 1,
            streamed: false,
            endedCleanly: true,
            conflict: recovered.conflict,
            plainWon: recovered.plainWon
          });
          return rewritten;
        }
        this.record({
          ...EMPTY_RUN,
          outcome: "non-stream",
          detail: (streamRequested ? `请求了流式但上游回的不是 SSE${contentType ? `（content-type: ${contentType}）` : ""}` : "本次请求没有开流式") + "，且没找到传输函数调用"
        });
        return rewritten;
      }
      return rewriteEventStream(sniffed, toolName, clientToolNames, (stats) => {
        this.record({
          outcome: stats.syntheticSeen ? "transported" : "no-synthetic-call",
          decodedChars: stats.decodedChars,
          emittedChars: stats.emittedChars,
          decodedChunks: stats.decodedChunks,
          // More than one carrying chunk is the proof that it arrived progressively.
          streamed: stats.decodedChunks > 1,
          endedCleanly: stats.sawDone,
          conflict: stats.contentConflict,
          plainWon: stats.plainWon
        });
      });
    }
    dispose() {
      this.enabled = false;
      if (!this.installed || !this.target || !this.original) {
        this.installed = false;
        return;
      }
      const current = this.target.fetch;
      if (current && current[MARKER$1]) {
        this.target.fetch = this.original;
        eventLog.info("anti-truncation interceptor removed");
      } else {
        eventLog.warn("anti-truncation: another patch is on top, leaving chain intact");
      }
      this.installed = false;
      this.target = void 0;
      this.original = void 0;
    }
  }
  const SSE_HEAD = /^\s*(?:data:|event:|id:|retry:|:)/;
  const JSON_ARRAY_HEAD = /^\s*\[/;
  const SNIFF_CHARS = 8;
  async function sniffResponseShape(response, contentType) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const consumed = [];
    let head = "";
    let ended = false;
    let readError;
    try {
      while (!ended && head.length < SNIFF_CHARS) {
        const { value, done } = await reader.read();
        if (done) {
          ended = true;
          break;
        }
        if (!value || value.length === 0) continue;
        consumed.push(value);
        head += decoder.decode(value, { stream: true });
      }
    } catch (error) {
      readError = error;
      ended = true;
    }
    const replay = new ReadableStream({
      start(controller) {
        for (const value of consumed) controller.enqueue(value);
        if (readError !== void 0) {
          controller.error(readError);
          return;
        }
        if (ended) controller.close();
      },
      async pull(controller) {
        const { value, done } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        controller.enqueue(value);
      },
      cancel(reason) {
        void reader.cancel(reason);
      }
    });
    const shape = JSON_ARRAY_HEAD.test(head) ? "json-array" : SSE_HEAD.test(head) || contentType.includes("text/event-stream") ? "sse" : "json";
    return {
      shape,
      response: new Response(replay, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      })
    };
  }
  function reframeJsonArrayStream(response) {
    const splitter = new JsonArrayStreamSplitter();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    const emit = (controller, element) => {
      controller.enqueue(encoder.encode(`data: ${flattenJsonElement(element)}

`));
    };
    const stream = new TransformStream({
      transform(chunk, controller) {
        for (const element of splitter.push(decoder.decode(chunk, { stream: true }))) {
          emit(controller, element);
        }
      },
      flush(controller) {
        for (const element of splitter.push(decoder.decode())) {
          emit(controller, element);
        }
        const rest = splitter.finish();
        if (rest.trim()) emit(controller, rest);
        if (splitter.complete) {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } else {
          eventLog.warn("anti-truncation: JSON array stream ended without its closing bracket");
        }
      }
    });
    void response.body.pipeTo(stream.writable).catch((error) => {
      eventLog.warn(`anti-truncation: JSON array stream aborted, ${describeError$1(error)}`);
    });
    return new Response(stream.readable, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  }
  function rewriteEventStream(response, toolName, clientToolNames, onComplete) {
    const rewriter = new SseContentRewriter(toolName, clientToolNames);
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buffer = "";
    const stream = new TransformStream({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        let boundary = buffer.indexOf("\n\n");
        while (boundary !== -1) {
          const rawEvent = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          const rewritten = rewriteEvent(rewriter, rawEvent);
          if (rewritten !== void 0) {
            controller.enqueue(encoder.encode(rewritten + "\n\n"));
          }
          boundary = buffer.indexOf("\n\n");
        }
      },
      flush(controller) {
        buffer += decoder.decode();
        const rest = buffer.trim();
        if (rest) {
          controller.enqueue(encoder.encode(buffer));
        }
        for (const payload of rewriter.finalizePending()) {
          controller.enqueue(encoder.encode(`data: ${payload}

`));
        }
        if (!rewriter.stats.sawDone) {
          eventLog.warn("anti-truncation: upstream stream ended without [DONE]");
        }
        onComplete?.(rewriter.stats);
      }
    });
    void response.body.pipeTo(stream.writable).catch((error) => {
      eventLog.warn(`anti-truncation: upstream stream aborted, ${describeError$1(error)}`);
    });
    return new Response(stream.readable, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  }
  function rewriteEvent(rewriter, rawEvent) {
    const lines = rawEvent.split("\n");
    const out = [];
    let sawData = false;
    let emittedData = false;
    for (const line2 of lines) {
      if (!line2.startsWith("data:")) {
        out.push(line2);
        continue;
      }
      sawData = true;
      const payload = line2.slice("data:".length).replace(/^ /, "");
      const rewritten = rewriter.transformPayload(payload);
      if (rewritten !== void 0) {
        out.push(`data: ${rewritten}`);
        emittedData = true;
      }
    }
    if (sawData && !emittedData) return void 0;
    return out.join("\n");
  }
  async function rewriteJsonResponse(response, toolName, clientToolNames) {
    let parsed;
    try {
      parsed = await response.clone().json();
    } catch (error) {
      eventLog.warn(`anti-truncation: response was not JSON, ${describeError$1(error)}`);
      return { response, recovered: void 0 };
    }
    let recovered;
    try {
      const choices = parsed["choices"];
      if (Array.isArray(choices)) {
        recovered = unwrapOpenAiChoices(choices, toolName, clientToolNames);
      }
      const google = unwrapGoogleContent(parsed, toolName, clientToolNames);
      if (google !== void 0) recovered = mergeRecovery(recovered, google);
    } catch (error) {
      eventLog.warn(`anti-truncation: could not unwrap JSON reply, ${describeError$1(error)}`);
      return { response, recovered: void 0 };
    }
    if (recovered === void 0) return { response, recovered };
    return {
      response: new Response(JSON.stringify(parsed), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      }),
      recovered
    };
  }
  function mergeRecovery(a, b) {
    if (!a) return b;
    return {
      chars: a.chars + b.chars,
      conflict: a.conflict || b.conflict,
      plainWon: a.plainWon || b.plainWon
    };
  }
  function longest(plain, carried) {
    let text = plain;
    let plainWon = true;
    for (const candidate of carried) {
      if (candidate.length >= text.length) {
        text = candidate;
        plainWon = false;
      }
    }
    const contenders = (plain ? 1 : 0) + carried.filter((entry) => entry !== "").length;
    return {
      text,
      chars: text.length,
      conflict: contenders > 1,
      plainWon: plainWon && contenders > 1
    };
  }
  function unwrapOpenAiChoices(choices, toolName, clientToolNames) {
    let recovered;
    for (const rawChoice of choices) {
      const choice = rawChoice;
      const message = choice["message"];
      if (!message) continue;
      const calls = message["tool_calls"];
      if (!Array.isArray(calls)) continue;
      const kept = [];
      const carried = [];
      for (const rawCall of calls) {
        const fn = rawCall?.function;
        if (fn && classifyToolName(fn["name"], toolName, clientToolNames) !== "client") {
          const value = readArgsContent(fn["arguments"]);
          if (typeof value === "string") {
            carried.push(value);
            continue;
          }
        }
        kept.push(rawCall);
      }
      if (carried.length === 0) continue;
      const plain = typeof message["content"] === "string" ? message["content"] : "";
      const best = longest(plain, carried);
      message["content"] = best.text;
      recovered = mergeRecovery(recovered, best);
      if (kept.length > 0) {
        message["tool_calls"] = kept;
      } else {
        delete message["tool_calls"];
        if (choice["finish_reason"] === "tool_calls") choice["finish_reason"] = "stop";
      }
    }
    return recovered;
  }
  function unwrapGoogleContent(parsed, toolName, clientToolNames) {
    const rawContent = parsed["responseContent"];
    if (!rawContent || typeof rawContent !== "object") return void 0;
    const content = rawContent;
    const parts = content["parts"];
    if (!Array.isArray(parts)) return void 0;
    const kept = [];
    const carried = [];
    let plain = "";
    let signature;
    for (const rawPart of parts) {
      const part = rawPart;
      const call = part?.["functionCall"];
      if (call && classifyToolName(call["name"], toolName, clientToolNames) !== "client") {
        const value = readArgsContent(call["args"]);
        if (typeof value === "string") {
          carried.push(value);
          if (part?.["thoughtSignature"] !== void 0) signature = part["thoughtSignature"];
          continue;
        }
      }
      if (part && part["thought"] !== true && typeof part["text"] === "string" && part["text"]) {
        plain += part["text"];
        if (signature === void 0 && part["thoughtSignature"] !== void 0) {
          signature = part["thoughtSignature"];
        }
        continue;
      }
      kept.push(rawPart);
    }
    if (carried.length === 0) return void 0;
    const choices = parsed["choices"];
    const message = Array.isArray(choices) ? choices[0]?.message : void 0;
    const wrapped = typeof message?.["content"] === "string" ? message["content"] : "";
    const best = longest(plain.length >= wrapped.length ? plain : wrapped, carried);
    const textPart = { text: best.text };
    if (signature !== void 0) textPart["thoughtSignature"] = signature;
    content["parts"] = [textPart, ...kept];
    if (message) message["content"] = best.text;
    return best;
  }
  function readArgsContent(args) {
    if (typeof args === "string") {
      if (!args) return void 0;
      try {
        const value = JSON.parse(args).content;
        if (typeof value === "string") return value;
        return void 0;
      } catch {
        const decoder = new IncrementalContentDecoder();
        const salvaged = decoder.feed(args) + decoder.finish();
        if (!salvaged) return void 0;
        eventLog.warn("anti-truncation: transport arguments were cut off, salvaged what parsed");
        return salvaged;
      }
    }
    if (args && typeof args === "object") {
      const value = args.content;
      return typeof value === "string" ? value : void 0;
    }
    return void 0;
  }
  function describeError$1(error) {
    return error instanceof Error ? error.message : String(error);
  }
  function resolveUrl$1(input) {
    try {
      if (typeof input === "string") return input;
      if (input instanceof URL) return input.href;
      if (input && typeof input === "object" && "url" in input) {
        const url = input.url;
        return typeof url === "string" ? url : void 0;
      }
    } catch {
    }
    return void 0;
  }
  async function readRequestBody(args) {
    const [input, init] = args;
    if (init?.body !== void 0 && init.body !== null) {
      return typeof init.body === "string" ? init.body : void 0;
    }
    if (input instanceof Request) {
      return await input.clone().text();
    }
    return void 0;
  }
  function withBody(args, body) {
    const [input, init] = args;
    if (init?.body !== void 0 && init.body !== null) {
      return [input, { ...init, body }];
    }
    if (input instanceof Request) {
      return [new Request(input, { body }), init];
    }
    return args;
  }
  const EMPTY_RUN = {
    decodedChars: 0,
    emittedChars: 0,
    decodedChunks: 0,
    streamed: false,
    endedCleanly: false,
    conflict: false,
    plainWon: false
  };
  const antiTruncationInterceptor = new AntiTruncationInterceptor();
  function isQuestionStep(step) {
    return step.type === "question";
  }
  const onboardingSteps = profile.onboardingSteps;
  function defaultAnswers() {
    const answers = {};
    for (const step of onboardingSteps) {
      if (isQuestionStep(step) && step.defaultValue !== void 0) {
        answers[step.id] = step.defaultValue;
      }
    }
    return answers;
  }
  function isStepVisible(step, answers) {
    if (!isQuestionStep(step)) {
      return step.content.trim() !== "" || (step.notice ?? "").trim() !== "";
    }
    if (!step.showWhen) {
      return true;
    }
    return Object.entries(step.showWhen).every(([key, expected]) => {
      const actual = answers[key];
      return Array.isArray(actual) ? actual.includes(expected) : actual === expected;
    });
  }
  function visibleSteps(answers) {
    return onboardingSteps.filter((step) => isStepVisible(step, answers));
  }
  function seededQuestions() {
    return onboardingSteps.filter(isQuestionStep).flatMap(
      (step) => step.seedFromPromptVariable ? [{ id: step.id, ...step.seedFromPromptVariable }] : []
    );
  }
  function questionSteps() {
    return onboardingSteps.filter(isQuestionStep);
  }
  function describeAnswer(questionId, value) {
    const question = questionSteps().find((step) => step.id === questionId);
    if (!question) {
      return String(value ?? "—");
    }
    if (Array.isArray(value)) {
      const labels = value.map((entry) => optionLabel(question, entry));
      return labels.length ? labels.join("、") : "—";
    }
    if (typeof value === "boolean") {
      return value ? "开启" : "关闭";
    }
    return optionLabel(question, value);
  }
  function optionLabel(question, value) {
    const option = question.options?.find((entry) => entry.id === value);
    return option?.label ?? String(value ?? "—");
  }
  const MODEL_FIELD_BY_SOURCE = {
    claude: "claude_model",
    openai: "openai_model",
    makersuite: "google_model",
    vertexai: "vertexai_model",
    openrouter: "openrouter_model",
    ai21: "ai21_model",
    mistralai: "mistralai_model",
    custom: "custom_model",
    cohere: "cohere_model",
    perplexity: "perplexity_model",
    groq: "groq_model",
    siliconflow: "siliconflow_model",
    minimax: "minimax_model",
    electronhub: "electronhub_model",
    chutes: "chutes_model",
    nanogpt: "nanogpt_model",
    deepseek: "deepseek_model",
    aimlapi: "aimlapi_model",
    xai: "xai_model",
    pollinations: "pollinations_model",
    cometapi: "cometapi_model",
    moonshot: "moonshot_model",
    fireworks: "fireworks_model",
    azure_openai: "azure_openai_model",
    zai: "zai_model",
    workers_ai: "workers_ai_model"
  };
  const PROVIDER_LABELS = {
    makersuite: "Google AI Studio (Gemini)",
    vertexai: "Google Vertex AI",
    claude: "Anthropic Claude",
    openai: "OpenAI",
    openrouter: "OpenRouter",
    custom: "Custom (OpenAI compatible)",
    deepseek: "DeepSeek",
    mistralai: "Mistral",
    xai: "xAI",
    groq: "Groq",
    cohere: "Cohere",
    moonshot: "Moonshot",
    zai: "Z.AI"
  };
  function has(name) {
    return typeof globalThis[name] === "function";
  }
  function attempt(label, fn, fallback) {
    try {
      return fn();
    } catch (error) {
      eventLog.warn(`adapter: ${label} failed`, error instanceof Error ? error.message : error);
      return fallback;
    }
  }
  class TavernHelperAdapter {
    // -------------------------------------------------------------------------------
    // Capability probing
    // -------------------------------------------------------------------------------
    /** True when the globals we need are present, i.e. we really are in a TH script. */
    isAvailable() {
      return has("getPreset") && has("generate") && has("eventOn");
    }
    /** True when script-only helpers are present (buttons, script id, script variables). */
    isScriptContext() {
      return has("getScriptId") && has("getButtonEvent") && has("appendInexistentScriptButtons");
    }
    canRunGeneration() {
      return has("generate");
    }
    // -------------------------------------------------------------------------------
    // Versions & environment
    // -------------------------------------------------------------------------------
    getTavernHelperVersion() {
      if (!has("getTavernHelperVersion")) return void 0;
      return attempt("getTavernHelperVersion", () => getTavernHelperVersion() || void 0, void 0);
    }
    getSillyTavernVersion() {
      if (!has("getTavernVersion")) return void 0;
      return attempt("getTavernVersion", () => getTavernVersion() || void 0, void 0);
    }
    getContext() {
      return attempt(
        "SillyTavern.getContext",
        () => {
          const global = globalThis["SillyTavern"];
          return typeof global?.getContext === "function" ? global.getContext() : void 0;
        },
        void 0
      );
    }
    /** The raw `chat_completion_source`, e.g. `makersuite`. Undefined if unreadable. */
    getCurrentProvider() {
      const settings = this.getContext()?.chatCompletionSettings;
      const source = settings?.["chat_completion_source"];
      return typeof source === "string" && source ? source : void 0;
    }
    /** A human-friendly provider name, falling back to the raw id. */
    getCurrentProviderLabel() {
      const source = this.getCurrentProvider();
      if (!source) return void 0;
      return PROVIDER_LABELS[source] ?? source;
    }
    getCurrentModel() {
      const settings = this.getContext()?.chatCompletionSettings;
      const source = this.getCurrentProvider();
      if (!settings || !source) return void 0;
      const field = MODEL_FIELD_BY_SOURCE[source] ?? `${source}_model`;
      const model = settings[field];
      return typeof model === "string" && model ? model : void 0;
    }
    getOnlineStatus() {
      const status = this.getContext()?.onlineStatus;
      return typeof status === "string" && status ? status : void 0;
    }
    getChatLength() {
      const chat = this.getContext()?.chat;
      return Array.isArray(chat) ? chat.length : void 0;
    }
    getCharacterName() {
      const context = this.getContext();
      if (!context) return void 0;
      const name = context["name2"];
      return typeof name === "string" && name ? name : void 0;
    }
    collectEnvironment() {
      return {
        provider: this.getCurrentProviderLabel(),
        model: this.getCurrentModel(),
        sillyTavernVersion: this.getSillyTavernVersion(),
        tavernHelperVersion: this.getTavernHelperVersion(),
        loadedPresetName: this.getLoadedPresetName(),
        chatLength: this.getChatLength(),
        characterName: this.getCharacterName(),
        onlineStatus: this.getOnlineStatus()
      };
    }
    // -------------------------------------------------------------------------------
    // Preset
    // -------------------------------------------------------------------------------
    getLoadedPresetName() {
      if (!has("getLoadedPresetName")) return void 0;
      return attempt("getLoadedPresetName", () => getLoadedPresetName() || void 0, void 0);
    }
    /**
     * The preset SillyTavern is *currently generating with*.
     *
     * Always `'in_use'`, never the on-disk preset: editing a preset in the tavern UI takes
     * effect immediately but is not saved until the user presses save, so `'in_use'` is the
     * only thing that reflects what a generation will actually send.
     */
    getCurrentPreset() {
      if (!has("getPreset")) return void 0;
      return attempt("getPreset(in_use)", () => getPreset("in_use"), void 0);
    }
    /**
     * Apply `updater` to the in-use preset.
     *
     * `render: 'immediate'` so the tavern's prompt list visibly reflects the change the
     * moment the user presses Apply — a debounced repaint reads as "nothing happened".
     */
    async updateCurrentPreset(updater) {
      if (!has("updatePresetWith")) {
        throw new Error("当前 TavernHelper 版本不支持修改预设 (updatePresetWith 不可用)");
      }
      await updatePresetWith("in_use", updater, { render: "immediate" });
    }
    /** Names of the presets SillyTavern knows about. */
    getPresetNames() {
      if (!has("getPresetNames")) return [];
      return attempt("getPresetNames", () => getPresetNames() ?? [], []);
    }
    /**
     * Apply `updater` to a SAVED preset and write it to disk.
     *
     * This is a genuinely different operation from `updateCurrentPreset`. Writing to
     * `'in_use'` only touches `oai_settings` (persisted via `saveSettingsDebounced`, and
     * therefore discarded the moment the user switches preset and comes back). Writing to a
     * NAMED preset goes through
     * `createOrReplacePreset → preset_manager.savePreset(name, …, { skipUpdate: true })`
     * (JS-Slash-Runner/src/function/preset.ts:658-687), which persists to the preset file.
     *
     * Note it reads the STORED preset, not the live one, so unrelated unsaved edits the user
     * has made in the prompt manager are not swept into the file as a side effect.
     */
    async updateNamedPreset(presetName, updater) {
      if (!has("updatePresetWith")) {
        throw new Error("当前 TavernHelper 版本不支持修改预设 (updatePresetWith 不可用)");
      }
      if (!this.getPresetNames().includes(presetName)) {
        throw new Error(`预设 '${presetName}' 不在酒馆的预设列表中`);
      }
      await updatePresetWith(presetName, updater, { render: "none" });
    }
    // -------------------------------------------------------------------------------
    // Generation
    // -------------------------------------------------------------------------------
    /**
     * Run a generation through TavernHelper.
     *
     * Note what this does NOT do: it never appends to the chat. TavernHelper's
     * `iframeGenerate` builds the request, awaits a response and returns the text
     * (JS-Slash-Runner/src/function/generate/index.ts:276-390) — there is no `addOneMessage`
     * anywhere in that path. That is why diagnostics need no snapshot/restore dance.
     */
    async runGeneration(request) {
      if (!has("generate")) {
        throw new Error("当前环境不支持生成 (generate 不可用)");
      }
      const config = {
        user_input: request.userInput ?? "",
        should_stream: request.stream ?? false,
        should_silence: request.silent ?? true,
        max_chat_history: request.maxChatHistory ?? "all"
      };
      if (request.customApi) config.custom_api = request.customApi;
      if (request.generationId) config.generation_id = request.generationId;
      if (request.overrides) config.overrides = request.overrides;
      const result = await generate(config);
      return typeof result === "string" ? result : result?.content ?? "";
    }
    stopGeneration(generationId) {
      if (!has("stopGenerationById")) return;
      attempt("stopGenerationById", () => stopGenerationById(generationId), false);
    }
    // -------------------------------------------------------------------------------
    // Persistence (script-scoped variables)
    // -------------------------------------------------------------------------------
    readScriptVariables() {
      if (!has("getVariables")) return void 0;
      return attempt("getVariables(script)", () => getVariables({ type: "script" }) ?? {}, void 0);
    }
    /**
     * Global variables — `extension_settings.variables.global`.
     *
     * The important property is where they are NOT: they live in SillyTavern's own settings,
     * not inside any preset, so they never travel when a preset is exported. That makes them
     * the right place to record "which installation is this", which is what lets the panel
     * tell the author's own state apart from state that shipped inside a downloaded preset.
     */
    readGlobalVariables() {
      if (!has("getVariables")) return void 0;
      return attempt("getVariables(global)", () => getVariables({ type: "global" }) ?? {}, void 0);
    }
    writeGlobalVariables(variables) {
      if (!has("replaceVariables")) return false;
      return attempt(
        "replaceVariables(global)",
        () => {
          replaceVariables(variables, { type: "global" });
          return true;
        },
        false
      );
    }
    writeScriptVariables(variables) {
      if (!has("replaceVariables")) return false;
      return attempt(
        "replaceVariables(script)",
        () => {
          replaceVariables(variables, { type: "script" });
          return true;
        },
        false
      );
    }
    // -------------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------------
    /**
     * Subscribe to a tavern/iframe event.
     *
     * Returns an unsubscribe function that is safe to call more than once. TavernHelper also
     * clears listeners on `pagehide` (predefine.js), but we never rely on that: explicit
     * disposal is what keeps re-initialisation from stacking duplicate handlers.
     */
    listenEvent(event, handler) {
      if (!has("eventOn")) {
        return () => void 0;
      }
      const subscription = attempt(
        `eventOn(${event})`,
        () => eventOn(event, handler),
        void 0
      );
      let stopped = false;
      return () => {
        if (stopped) return;
        stopped = true;
        attempt(`eventOff(${event})`, () => subscription?.stop(), void 0);
      };
    }
    /**
     * Subscribe, but run BEFORE any listener already registered for this event.
     *
     * Needed by `PromptStructureInspector`: extensions inject by mutating `eventData.chat`
     * during `CHAT_COMPLETION_PROMPT_READY`, so observing the pristine array requires being
     * first in the queue. Falls back to an ordinary subscription when `eventMakeFirst` is
     * unavailable — the snapshot is then merely less pristine, not wrong.
     */
    listenEventFirst(event, handler) {
      if (!has("eventMakeFirst")) {
        return this.listenEvent(event, handler);
      }
      const subscription = attempt(
        `eventMakeFirst(${event})`,
        () => eventMakeFirst(event, handler),
        void 0
      );
      let stopped = false;
      return () => {
        if (stopped) return;
        stopped = true;
        attempt(`eventOff(${event})`, () => subscription?.stop(), void 0);
      };
    }
    /**
     * SillyTavern's extension injection registry.
     *
     * `setExtensionPrompt` (script.js:8899) writes into this map, so it is an exact ledger of
     * which extensions are adding text to the prompt.
     */
    getExtensionPrompts() {
      const prompts = this.getContext()?.["extensionPrompts"];
      return prompts && typeof prompts === "object" ? prompts : void 0;
    }
    /** Raw `oai_settings`, for checks that need fields we do not model individually. */
    getChatCompletionSettings() {
      return this.getContext()?.chatCompletionSettings;
    }
    /** Well-known event names, or `undefined` when the constant is missing. */
    eventName(scope, key) {
      const table = globalThis[scope === "tavern" ? "tavern_events" : "iframe_events"];
      const value = table?.[key];
      return typeof value === "string" ? value : void 0;
    }
    // -------------------------------------------------------------------------------
    // Script identity & buttons
    // -------------------------------------------------------------------------------
    getScriptId() {
      if (!has("getScriptId")) return void 0;
      return attempt("getScriptId", () => getScriptId() || void 0, void 0);
    }
    /**
     * Register the persistent launcher button.
     *
     * `appendInexistentScriptButtons` is idempotent upstream ("不会重复添加同名按钮"), so
     * repeated initialisation cannot produce duplicate buttons.
     */
    ensureButton(name) {
      if (!this.isScriptContext()) return void 0;
      return attempt(
        "appendInexistentScriptButtons",
        () => {
          appendInexistentScriptButtons([{ name, visible: true }]);
          return getButtonEvent(name);
        },
        void 0
      );
    }
    // -------------------------------------------------------------------------------
    // Host document & misc
    // -------------------------------------------------------------------------------
    /**
     * The document the UI must be mounted into.
     *
     * A TavernHelper script runs inside a hidden iframe, so `document` here is invisible.
     * `predefine.js` deliberately rebinds `$`/`_`/`SillyTavern` to the parent for this
     * reason. Falls back to the local document if we are somehow not framed.
     */
    getHostDocument() {
      try {
        const parentDocument = window.parent?.document;
        if (parentDocument && parentDocument !== document) {
          return parentDocument;
        }
      } catch {
      }
      return document;
    }
    /**
     * Re-render existing chat messages.
     *
     * Only needed after a DISPLAY regex is toggled: the preset change takes effect for new
     * generations immediately, but messages already on screen keep their old rendering until
     * the chat is re-rendered. Without this, switching the chain-of-thought viewer on appears
     * to do nothing until the next reply.
     *
     * Deliberately not `replaceTavernRegexes`, which upstream documents as slow and which
     * fires `CHAT_CHANGED`.
     */
    async reloadChatDisplay() {
      const reload = globalThis["builtin"];
      if (typeof reload?.reloadAndRenderChatWithoutEvents !== "function") {
        return false;
      }
      try {
        await reload.reloadAndRenderChatWithoutEvents();
        return true;
      } catch (error) {
        eventLog.warn("chat re-render failed", error instanceof Error ? error.message : error);
        return false;
      }
    }
    /**
     * Count tokens with SillyTavern's own tokenizer for the current model.
     *
     * Exposed as `getTokenCountAsync` on the context (scripts/tokenizers.js:443). Using it
     * beats estimating: a characters-per-token ratio is a guess, and for a target expressed
     * in tokens a guess is worse than no number at all.
     *
     * Returns `undefined` when unavailable, so callers can say so instead of showing a
     * fabricated figure.
     */
    async countTokens(text) {
      const context = this.getContext();
      if (typeof context?.getTokenCountAsync !== "function") {
        return void 0;
      }
      try {
        const count = await context.getTokenCountAsync(text);
        return typeof count === "number" && Number.isFinite(count) ? count : void 0;
      } catch (error) {
        eventLog.warn("token count failed", error instanceof Error ? error.message : error);
        return void 0;
      }
    }
    copyText(text) {
      if (has("builtin") || typeof builtin?.copyText === "function") {
        const copied = attempt(
          "builtin.copyText",
          () => {
            builtin.copyText(text);
            return true;
          },
          false
        );
        if (copied) return true;
      }
      return attempt(
        "navigator.clipboard",
        () => {
          void navigator.clipboard?.writeText(text);
          return true;
        },
        false
      );
    }
    notify(level, message, title) {
      attempt(
        "toastr",
        () => {
          const global = globalThis["toastr"];
          global?.[level]?.(message, title);
        },
        void 0
      );
    }
  }
  const adapter = new TavernHelperAdapter();
  const ROOT_KEY = "keminiCompanion";
  const MAX_HISTORY = 20;
  const MAX_GLOBAL_ROOT_KEYS = 8;
  function emptyState() {
    return {
      onboardingCompleted: false,
      answers: defaultAnswers(),
      panelVersion: PANEL_VERSION,
      presetVersion: presetIdentity.presetVersion,
      configSchemaVersion: CONFIG_SCHEMA_VERSION,
      diagnosticHistory: [],
      autoSaveToPresetFile: true,
      antiTruncationEnabled: true
    };
  }
  class SettingsStore {
    cache;
    cachedInstallId;
    /** Set when persistence is unavailable, so the UI can say so instead of lying. */
    persistent = true;
    get isPersistent() {
      return this.persistent;
    }
    /**
     * A stable id for THIS SillyTavern installation, created on first use.
     *
     * Stored in global variables so it never leaves the machine inside an exported preset.
     * Returns `undefined` when globals are unreadable, in which case the caller falls back to
     * trusting the stored flag rather than locking the user out of a completed setup.
     */
    installId() {
      if (this.cachedInstallId) {
        return this.cachedInstallId;
      }
      const globals = adapter.readGlobalVariables();
      if (!globals) {
        return void 0;
      }
      const { installId: salvaged, corrupt } = readGlobalRoot(globals[ROOT_KEY]);
      if (salvaged && !corrupt) {
        this.cachedInstallId = salvaged;
        return salvaged;
      }
      const id = salvaged ?? `kmc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      const written = adapter.writeGlobalVariables({ ...globals, [ROOT_KEY]: { installId: id } });
      if (!written) {
        return void 0;
      }
      this.cachedInstallId = id;
      eventLog.info(corrupt ? "corrupt global install record rewritten" : "install id created");
      return id;
    }
    load() {
      if (this.cache) {
        return this.cache;
      }
      const raw = adapter.readScriptVariables();
      if (raw === void 0) {
        this.persistent = false;
        eventLog.warn("settings: script variables unavailable, using in-memory state");
        this.cache = emptyState();
        return this.cache;
      }
      const stored = raw[ROOT_KEY];
      this.cache = this.migrate(stored);
      return this.cache;
    }
    /**
     * Coerce whatever is on disk into a valid state.
     *
     * Persisted data is untrusted input: it may be from an older panel, a newer panel, or
     * hand-edited. Every field is validated individually and bad ones fall back to defaults
     * rather than throwing.
     */
    migrate(stored) {
      const base = emptyState();
      if (!stored || typeof stored !== "object") {
        return base;
      }
      const candidate = stored;
      const install = this.installId();
      if (install !== void 0 && candidate.completedBy !== install) {
        if (candidate.onboardingCompleted === true) {
          eventLog.info("stored state belongs to another installation; starting fresh");
        }
        return base;
      }
      const schemaVersion = typeof candidate.configSchemaVersion === "number" ? candidate.configSchemaVersion : 0;
      const answersUsable = schemaVersion === CONFIG_SCHEMA_VERSION;
      if (!answersUsable && schemaVersion !== 0) {
        eventLog.info(
          `settings: config schema ${schemaVersion} → ${CONFIG_SCHEMA_VERSION}, answers reset to defaults`
        );
      }
      const answers = answersUsable && candidate.answers && typeof candidate.answers === "object" ? { ...base.answers, ...candidate.answers } : base.answers;
      const history = Array.isArray(candidate.diagnosticHistory) ? candidate.diagnosticHistory.filter(isDiagnosticResultLike).slice(-MAX_HISTORY) : [];
      return {
        onboardingCompleted: candidate.onboardingCompleted === true,
        answers,
        panelVersion: PANEL_VERSION,
        presetVersion: presetIdentity.presetVersion,
        configSchemaVersion: CONFIG_SCHEMA_VERSION,
        ...typeof candidate.lastAppliedAt === "number" ? { lastAppliedAt: candidate.lastAppliedAt } : {},
        diagnosticHistory: history,
        // Only an explicit `false` disables it; anything else (including data written by an
        // older panel version that had no such field) keeps the safe default of saving.
        autoSaveToPresetFile: candidate.autoSaveToPresetFile !== false,
        // Ships ON. `!== false`, not `=== true`: a state written before this setting existed
        // has no key at all, and those installs must come up enabled like a fresh one. Only an
        // explicit opt-out disables it.
        antiTruncationEnabled: candidate.antiTruncationEnabled !== false,
        ...candidate.completedBy ? { completedBy: candidate.completedBy } : {}
      };
    }
    persist() {
      if (!this.cache) return;
      const existing = adapter.readScriptVariables();
      if (existing === void 0) {
        this.persistent = false;
        return;
      }
      const written = adapter.writeScriptVariables({ ...existing, [ROOT_KEY]: this.cache });
      if (!written) {
        this.persistent = false;
        eventLog.warn("settings: write failed, state kept in memory only");
      }
    }
    update(mutate) {
      const state = this.load();
      mutate(state);
      this.persist();
      return state;
    }
    // ---------------------------------------------------------------------------------
    // Convenience accessors
    // ---------------------------------------------------------------------------------
    get onboardingCompleted() {
      return this.load().onboardingCompleted;
    }
    get autoSaveToPresetFile() {
      return this.load().autoSaveToPresetFile;
    }
    setAutoSaveToPresetFile(enabled) {
      this.update((state) => {
        state.autoSaveToPresetFile = enabled;
      });
      eventLog.info(`auto-save to preset file ${enabled ? "enabled" : "disabled"}`);
    }
    get antiTruncationEnabled() {
      return this.load().antiTruncationEnabled;
    }
    /**
     * Turning the transport off has to STICK.
     *
     * State whose `completedBy` does not match this installation is discarded wholesale on the
     * next load, so before onboarding is finished there is nothing to own the choice — and
     * since the transport now defaults to ON, a discarded "off" silently comes back on. That
     * reads as the switch ignoring the user. Stamping the install id claims the state for this
     * machine; `onboardingCompleted` stays false, so the wizard is still shown.
     */
    setAntiTruncationEnabled(enabled) {
      const install = this.installId();
      this.update((state) => {
        state.antiTruncationEnabled = enabled;
        if (install) {
          state.completedBy = install;
        }
      });
    }
    getAnswers() {
      return { ...defaultAnswers(), ...this.load().answers };
    }
    saveAnswers(answers) {
      this.update((state) => {
        state.answers = { ...answers };
      });
    }
    markOnboardingCompleted() {
      const install = this.installId();
      this.update((state) => {
        state.onboardingCompleted = true;
        state.lastAppliedAt = Date.now();
        if (install) {
          state.completedBy = install;
        }
      });
      eventLog.info("onboarding marked complete");
    }
    resetOnboarding() {
      this.update((state) => {
        state.onboardingCompleted = false;
        delete state.completedBy;
      });
      eventLog.info("onboarding reset");
    }
    getDiagnosticHistory() {
      return this.load().diagnosticHistory;
    }
    addDiagnosticResult(result) {
      this.update((state) => {
        state.diagnosticHistory.push(result);
        if (state.diagnosticHistory.length > MAX_HISTORY) {
          state.diagnosticHistory.splice(0, state.diagnosticHistory.length - MAX_HISTORY);
        }
      });
    }
    clearDiagnosticHistory() {
      this.update((state) => {
        state.diagnosticHistory = [];
      });
    }
  }
  function readGlobalRoot(value) {
    if (value === void 0 || value === null) {
      return { corrupt: false };
    }
    if (typeof value !== "object" || Array.isArray(value)) {
      return { corrupt: true };
    }
    const record = value;
    const id = record["installId"];
    const installId = typeof id === "string" && id ? id : void 0;
    return Object.keys(record).length > MAX_GLOBAL_ROOT_KEYS ? { ...installId ? { installId } : {}, corrupt: true } : { ...installId ? { installId } : {}, corrupt: false };
  }
  function isDiagnosticResultLike(value) {
    return value !== null && typeof value === "object" && typeof value.timestamp === "number" && typeof value.success === "boolean";
  }
  const settingsStore = new SettingsStore();
  const MAX_OBSERVED = 10;
  class DiagnosticStore {
    observedFailures = [];
    configurationIssues = [];
    listeners = /* @__PURE__ */ new Set();
    subscribe(listener) {
      this.listeners.add(listener);
      return () => this.listeners.delete(listener);
    }
    emit() {
      for (const listener of [...this.listeners]) {
        try {
          listener();
        } catch (error) {
          eventLog.warn("diagnostic store listener threw", error);
        }
      }
    }
    // ---------------------------------------------------------------------------------
    // Active diagnostics
    // ---------------------------------------------------------------------------------
    recordResult(result) {
      settingsStore.addDiagnosticResult(result);
      eventLog.info(
        result.success ? `generation diagnostic succeeded in ${result.durationMs} ms` : `generation diagnostic failed: ${describeError(result.error)}`
      );
      this.emit();
    }
    history() {
      return [...settingsStore.getDiagnosticHistory()].reverse();
    }
    latest() {
      return this.history()[0];
    }
    lastSuccessAt() {
      return this.history().find((entry) => entry.success)?.timestamp;
    }
    lastFailureAt() {
      return this.history().find((entry) => !entry.success)?.timestamp;
    }
    clearHistory() {
      settingsStore.clearDiagnosticHistory();
      this.emit();
    }
    // ---------------------------------------------------------------------------------
    // Passively observed chat failures
    // ---------------------------------------------------------------------------------
    recordObservedFailure(failure) {
      this.observedFailures.push(failure);
      if (this.observedFailures.length > MAX_OBSERVED) {
        this.observedFailures.shift();
      }
      eventLog.warn(`observed chat generation failure (${failure.confidence})`);
      this.emit();
    }
    observed() {
      return [...this.observedFailures].reverse();
    }
    /**
     * Whether a *real* (interceptor-captured) failure was recorded very recently.
     *
     * The inferred watcher uses this to stay quiet: when the fetch interceptor already has
     * the actual HTTP status and provider message for the same failure, adding a vague
     * "something went wrong" entry on top would only bury the useful one.
     */
    hasRecentObservedFailure(withinMs = 15e3) {
      const cutoff = Date.now() - withinMs;
      return this.observedFailures.some(
        (failure) => failure.confidence === "observed" && failure.timestamp >= cutoff
      );
    }
    latestObserved() {
      return this.observed()[0];
    }
    // ---------------------------------------------------------------------------------
    // Preset configuration problems
    // ---------------------------------------------------------------------------------
    recordConfigurationIssue(issue) {
      this.configurationIssues.push(issue);
      if (this.configurationIssues.length > MAX_OBSERVED) {
        this.configurationIssues.shift();
      }
      eventLog.warn(`preset configuration error: ${issue.message}`);
      this.emit();
    }
    configurationProblems() {
      return [...this.configurationIssues].reverse();
    }
    /** Overall health, used for the status dot on the overview tab. */
    status() {
      const latest = this.latest();
      if (this.latestObserved()) {
        return { level: "warn", label: "最近一次聊天生成疑似失败" };
      }
      if (this.configurationProblems().length > 0) {
        return { level: "warn", label: "预设配置存在问题" };
      }
      if (!latest) {
        return { level: "unknown", label: "尚未测试" };
      }
      return latest.success ? { level: "ok", label: "正常" } : { level: "error", label: "上次生成诊断失败" };
    }
  }
  function describeError(error) {
    if (!error) return "unknown error";
    return [error.httpStatus ? `HTTP ${error.httpStatus}` : "", error.code ?? "", error.message].filter(Boolean).join(" ");
  }
  const diagnosticStore = new DiagnosticStore();
  const REDACTED = "[REDACTED]";
  const SENSITIVE_KEY_FRAGMENTS = [
    "authorization",
    "apikey",
    "xapikey",
    "accesstoken",
    "refreshtoken",
    "idtoken",
    "bearertoken",
    "token",
    "secret",
    "password",
    "passwd",
    "cookie",
    "sessionid",
    "session",
    "credential",
    "privatekey",
    "clientsecret",
    "proxypassword",
    "reverseproxy"
  ];
  const BULK_CONTENT_KEYS = [
    "messages",
    "chat",
    "prompt",
    "prompts",
    "content",
    "description",
    "personality",
    "scenario",
    "firstmes",
    "mesexample",
    "chathistory"
  ];
  const MAX_STRING_LENGTH = 2e3;
  const MAX_ARRAY_LENGTH = 20;
  const MAX_DEPTH = 8;
  function normaliseKey(key) {
    return key.toLowerCase().replace(/[^a-z0-9]/g, "");
  }
  function isSensitiveKey(key) {
    const normalised = normaliseKey(key);
    return SENSITIVE_KEY_FRAGMENTS.some((fragment) => normalised.includes(fragment));
  }
  function isBulkContentKey(key) {
    return BULK_CONTENT_KEYS.includes(normaliseKey(key));
  }
  function sanitizeString(input) {
    let output = input;
    output = output.replace(/\b(Bearer|Basic)\s+[A-Za-z0-9._\-+/=]{8,}/gi, `$1 ${REDACTED}`);
    output = output.replace(
      /("?\b(?:api[_-]?key|access[_-]?token|refresh[_-]?token|auth[_-]?token|password|secret)\b"?\s*[:=]\s*"?)([^"&,\s}]{4,})/gi,
      `$1${REDACTED}`
    );
    output = output.replace(/\bsk-[A-Za-z0-9._\-]{16,}/g, REDACTED);
    output = output.replace(/\bsk-ant-[A-Za-z0-9._\-]{16,}/g, REDACTED);
    output = output.replace(/\bAIza[0-9A-Za-z._\-]{20,}/g, REDACTED);
    output = output.replace(/\bxai-[A-Za-z0-9]{16,}/g, REDACTED);
    output = output.replace(
      /([?&](?:key|api_key|apikey|access_token|token)=)[^&\s]+/gi,
      `$1${REDACTED}`
    );
    if (output.length > MAX_STRING_LENGTH) {
      output = `${output.slice(0, MAX_STRING_LENGTH)}… [truncated ${output.length - MAX_STRING_LENGTH} chars]`;
    }
    return output;
  }
  function sanitizeDiagnosticData(value) {
    return sanitizeInternal(value, 0, /* @__PURE__ */ new WeakSet());
  }
  function sanitizeInternal(value, depth, seen) {
    if (value === null || value === void 0) {
      return value;
    }
    const primitive = typeof value;
    if (primitive === "string") {
      return sanitizeString(value);
    }
    if (primitive === "number" || primitive === "boolean") {
      return value;
    }
    if (primitive === "bigint") {
      return `${value.toString()}n`;
    }
    if (primitive === "function" || primitive === "symbol") {
      return `[${primitive}]`;
    }
    if (depth >= MAX_DEPTH) {
      return "[max depth reached]";
    }
    const asObject = value;
    if (seen.has(asObject)) {
      return "[circular]";
    }
    seen.add(asObject);
    try {
      if (value instanceof Error) {
        return {
          name: value.name,
          message: sanitizeString(value.message),
          ...value.stack ? { stack: sanitizeString(value.stack) } : {}
        };
      }
      if (Array.isArray(value)) {
        const trimmed = value.slice(0, MAX_ARRAY_LENGTH);
        const result = trimmed.map((item) => sanitizeInternal(item, depth + 1, seen));
        if (value.length > MAX_ARRAY_LENGTH) {
          result.push(`[… ${value.length - MAX_ARRAY_LENGTH} more items]`);
        }
        return result;
      }
      if (value instanceof Map) {
        return sanitizeInternal(Object.fromEntries(value.entries()), depth, seen);
      }
      if (value instanceof Set) {
        return sanitizeInternal(Array.from(value.values()), depth, seen);
      }
      if (value instanceof Date) {
        return value.toISOString();
      }
      if (typeof asObject.headers === "object" && "status" in asObject) {
        const responseLike = asObject;
        return {
          status: responseLike.status,
          statusText: responseLike.statusText,
          url: typeof responseLike.url === "string" ? sanitizeString(responseLike.url) : void 0,
          headers: REDACTED
        };
      }
      const output = {};
      for (const [key, entry] of Object.entries(value)) {
        if (isSensitiveKey(key)) {
          output[key] = REDACTED;
          continue;
        }
        if (isBulkContentKey(key)) {
          output[key] = summariseBulk(entry);
          continue;
        }
        output[key] = sanitizeInternal(entry, depth + 1, seen);
      }
      return output;
    } catch (error) {
      return `[unsanitisable: ${error instanceof Error ? error.name : "unknown"}]`;
    } finally {
      seen.delete(asObject);
    }
  }
  function summariseBulk(value) {
    if (typeof value === "string") {
      return `[${value.length} chars omitted]`;
    }
    if (Array.isArray(value)) {
      return `[${value.length} items omitted]`;
    }
    if (value === null || value === void 0) {
      return String(value);
    }
    return "[omitted]";
  }
  const HTTP_WITH_BODY = /^HTTP\s+(\d{3})\s*:\s*([\s\S]*)$/i;
  const ST_STATUS_ONLY = /^Got response status\s+(\d{3})/i;
  const TH_STREAM_WRAPPER = /^Generate method error:\s*([\s\S]*)$/i;
  const LOOSE_STATUS = /\b(?:status(?:\s+code)?|HTTP)\D{0,3}(\d{3})\b/i;
  const ERROR_NAME_PREFIX = /^\s*(?:[A-Za-z_$][\w$]*Error|Error)\s*:\s*/;
  function parseGenerationError(error) {
    const base = {
      timestamp: Date.now(),
      source: "unknown",
      message: "Unknown generation error"
    };
    try {
      return parseInternal(error, base);
    } catch {
      return {
        ...base,
        message: safeStringify(error),
        raw: sanitizeDiagnosticData(error)
      };
    }
  }
  function parseInternal(error, base) {
    const result = { ...base, raw: sanitizeDiagnosticData(error) };
    if (error instanceof Error) {
      if (error.stack) {
        result.stack = sanitizeString(error.stack);
      }
      if (error.name === "AbortError") {
        return { ...result, source: "network", message: "生成请求已被中止 (AbortError)" };
      }
      if (error.name === "TypeError" && /fetch|network/i.test(error.message)) {
        return {
          ...result,
          source: "network",
          message: sanitizeString(error.message)
        };
      }
    }
    const message = extractTopLevelMessage(error);
    const streamWrapped = TH_STREAM_WRAPPER.exec(message);
    if (streamWrapped?.[1]) {
      let inner_text = streamWrapped[1];
      while (ERROR_NAME_PREFIX.test(inner_text)) {
        inner_text = inner_text.replace(ERROR_NAME_PREFIX, "");
      }
      const inner = parseInternal(inner_text, base);
      return {
        ...inner,
        stack: result.stack ?? inner.stack,
        raw: result.raw
      };
    }
    const withBody2 = HTTP_WITH_BODY.exec(message);
    if (withBody2?.[1]) {
      const httpStatus = Number(withBody2[1]);
      const body = withBody2[2] ?? "";
      const fromBody2 = parseProviderBody(body);
      return {
        ...result,
        source: fromBody2.source ?? "provider",
        httpStatus,
        ...fromBody2.code ? { code: fromBody2.code } : {},
        ...fromBody2.type ? { type: fromBody2.type } : {},
        ...fromBody2.message ? { providerMessage: fromBody2.message } : {},
        message: fromBody2.message ?? `HTTP ${httpStatus}`
      };
    }
    const statusOnly = ST_STATUS_ONLY.exec(message);
    if (statusOnly?.[1]) {
      const httpStatus = Number(statusOnly[1]);
      return {
        ...result,
        source: "sillytavern",
        httpStatus,
        bodyUnavailable: true,
        message: `HTTP ${httpStatus}（SillyTavern 未保留服务器返回的错误内容）`
      };
    }
    if (message.trim() === "[object Object]") {
      return {
        ...result,
        source: "sillytavern",
        bodyUnavailable: true,
        message: "SillyTavern 抛出了无法读取的错误对象（[object Object]）"
      };
    }
    if (error !== null && typeof error === "object") {
      const structured = parseStructuredError(error);
      if (structured) {
        return { ...result, ...structured };
      }
    }
    const fromBody = parseProviderBody(message);
    if (fromBody.message) {
      return {
        ...result,
        source: fromBody.source ?? "provider",
        ...fromBody.httpStatus ? { httpStatus: fromBody.httpStatus } : {},
        ...fromBody.code ? { code: fromBody.code } : {},
        ...fromBody.type ? { type: fromBody.type } : {},
        providerMessage: fromBody.message,
        message: fromBody.message
      };
    }
    const loose = LOOSE_STATUS.exec(message);
    return {
      ...result,
      ...loose?.[1] ? { httpStatus: Number(loose[1]) } : {},
      message: message ? sanitizeString(message) : "Unknown generation error"
    };
  }
  function parseProviderBody(body) {
    const trimmed = body.trim();
    if (!trimmed) {
      return {};
    }
    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      const text = sanitizeString(stripHtml(trimmed));
      return text ? { source: "provider", message: text } : {};
    }
    if (typeof parsed === "string") {
      return { source: "provider", message: sanitizeString(parsed) };
    }
    if (parsed === null || typeof parsed !== "object") {
      return {};
    }
    const root = parsed;
    const fields = parseStructuredError(root);
    return fields ?? {};
  }
  function parseStructuredError(root) {
    const response = root["response"];
    if (response && typeof response === "object") {
      const responseObject = response;
      const data = responseObject["data"];
      if (data && typeof data === "object") {
        const inner = parseStructuredError(data) ?? {};
        const status = asNumber(responseObject["status"]);
        return { source: "provider", ...status ? { httpStatus: status } : {}, ...inner };
      }
    }
    if (typeof response === "string" && response.trim()) {
      return { source: "provider", message: sanitizeString(response) };
    }
    const errorNode = root["error"];
    if (root["type"] === "error" && errorNode && typeof errorNode === "object") {
      const node = errorNode;
      return {
        source: "provider",
        ...asString(node["type"]) ? { type: asString(node["type"]) } : {},
        ...asString(node["message"]) ? { message: sanitizeString(asString(node["message"])) } : {}
      };
    }
    if (errorNode && typeof errorNode === "object") {
      const node = errorNode;
      const numericCode = asNumber(node["code"]);
      const statusString = asString(node["status"]);
      const stringCode = asString(node["code"]);
      return {
        source: "provider",
        ...numericCode ? { httpStatus: numericCode } : {},
        ...statusString ? { code: statusString } : stringCode ? { code: stringCode } : {},
        ...asString(node["type"]) ? { type: asString(node["type"]) } : {},
        ...asString(node["message"]) ? { message: sanitizeString(asString(node["message"])) } : {}
      };
    }
    if (typeof errorNode === "string" && errorNode.trim()) {
      return { source: "provider", message: sanitizeString(errorNode) };
    }
    const detail = root["detail"];
    if (detail && typeof detail === "object") {
      const inner = parseStructuredError(detail);
      if (inner?.message) {
        return inner;
      }
    }
    if (typeof detail === "string" && detail.trim()) {
      return { source: "provider", message: sanitizeString(detail) };
    }
    const bareMessage = asString(root["message"]);
    if (bareMessage) {
      return {
        source: "provider",
        ...asString(root["code"]) ? { code: asString(root["code"]) } : {},
        ...asString(root["type"]) ? { type: asString(root["type"]) } : {},
        message: sanitizeString(bareMessage)
      };
    }
    return void 0;
  }
  function extractTopLevelMessage(error) {
    if (typeof error === "string") {
      return error;
    }
    if (error instanceof Error) {
      return error.message;
    }
    if (error !== null && typeof error === "object") {
      const message = asString(error["message"]);
      if (message) {
        return message;
      }
      return safeStringify(error);
    }
    return String(error ?? "");
  }
  function stripHtml(input) {
    if (!/<[a-z!/]/i.test(input)) {
      return input;
    }
    return input.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
  function asString(value) {
    return typeof value === "string" && value.trim() ? value : void 0;
  }
  function asNumber(value) {
    return typeof value === "number" && Number.isFinite(value) ? value : void 0;
  }
  function safeStringify(value) {
    try {
      const json = JSON.stringify(sanitizeDiagnosticData(value));
      return json && json !== "{}" ? json : String(value);
    } catch {
      return String(value);
    }
  }
  function summariseGenerationError(error) {
    const parts = [];
    if (error.httpStatus) {
      parts.push(`HTTP ${error.httpStatus}`);
    }
    if (error.code) {
      parts.push(error.code);
    }
    if (parts.length === 0) {
      return error.message;
    }
    return `${parts.join(" · ")} — ${error.message}`;
  }
  const MARKER = "__keminiFetchInterceptor__";
  const GENERATION_ENDPOINT = /\/api\/backends\/[^/]+\/generate\b/;
  class FetchErrorInterceptor {
    installed = false;
    disposed = false;
    original;
    target;
    install() {
      if (this.installed) return;
      let target;
      try {
        target = window.parent ?? window;
        void target.fetch;
      } catch {
        eventLog.warn("fetch interceptor: parent window unreachable, not installed");
        return;
      }
      const current = target.fetch;
      if (typeof current !== "function") {
        eventLog.warn("fetch interceptor: no fetch on target window");
        return;
      }
      const original = current[MARKER]?.original ?? current;
      const self = this;
      const wrapper = function patchedFetch(...args) {
        const promise = original.apply(this ?? target, args);
        if (self.disposed) {
          return promise;
        }
        try {
          const url = resolveUrl(args[0]);
          if (url && GENERATION_ENDPOINT.test(url)) {
            void promise.then((response) => {
              if (!response.ok) {
                self.inspect(response);
              }
            }).catch(() => {
            });
          }
        } catch {
        }
        return promise;
      };
      wrapper[MARKER] = { original };
      target.fetch = wrapper;
      this.original = original;
      this.target = target;
      this.installed = true;
      this.disposed = false;
      eventLog.info("fetch error interceptor installed");
    }
    /** Read the error body off a clone so SillyTavern's own read is unaffected. */
    inspect(response) {
      let clone;
      try {
        clone = response.clone();
      } catch {
        return;
      }
      void clone.text().then((body) => {
        if (this.disposed) return;
        const parsed = parseGenerationError(
          new Error(`HTTP ${response.status}: ${body}`)
        );
        diagnosticStore.recordObservedFailure({
          timestamp: Date.now(),
          confidence: "observed",
          message: parsed.message,
          error: parsed,
          ...adapter.getCurrentProviderLabel() ? { provider: adapter.getCurrentProviderLabel() } : {},
          ...adapter.getCurrentModel() ? { model: adapter.getCurrentModel() } : {}
        });
        eventLog.warn(
          `chat generation failed: HTTP ${response.status}${parsed.code ? ` ${parsed.code}` : ""}`
        );
      }).catch(() => {
      });
    }
    dispose() {
      this.disposed = true;
      if (!this.installed || !this.target || !this.original) {
        this.installed = false;
        return;
      }
      const current = this.target.fetch;
      if (current && current[MARKER]) {
        this.target.fetch = this.original;
        eventLog.info("fetch error interceptor removed");
      } else {
        eventLog.warn("fetch interceptor: another patch is on top, leaving chain intact");
      }
      this.installed = false;
      this.target = void 0;
      this.original = void 0;
    }
  }
  function resolveUrl(input) {
    try {
      if (typeof input === "string") return input;
      if (input instanceof URL) return input.href;
      if (input && typeof input === "object" && "url" in input) {
        const url = input.url;
        return typeof url === "string" ? url : void 0;
      }
    } catch {
    }
    return void 0;
  }
  const fetchErrorInterceptor = new FetchErrorInterceptor();
  const configurablePrompts = profile.configurablePrompts;
  const configurableRegexes = profile.configurableRegexes;
  function getRegexDefinition(key) {
    return configurableRegexes.find((entry) => entry.key === key || entry.stableId === key);
  }
  function regexDisplayName(stableId) {
    return configurableRegexes.find((entry) => entry.stableId === stableId)?.displayName ?? stableId;
  }
  const byKey = new Map(
    configurablePrompts.map((definition) => [definition.key, definition])
  );
  function getPromptDefinition(key) {
    return byKey.get(key);
  }
  function displayNameForStableId(stableId) {
    return configurablePrompts.find((definition) => definition.stableId === stableId)?.displayName ?? stableId;
  }
  const OPEN = "{{";
  const CLOSE = "}}";
  function prefixFor(variable) {
    return `${OPEN}setvar::${variable}::`;
  }
  function locateSetvar(content, variable) {
    const prefix = prefixFor(variable);
    const start = content.indexOf(prefix);
    if (start < 0) {
      return void 0;
    }
    const valueStart = start + prefix.length;
    let depth = 1;
    let index = valueStart;
    while (index < content.length) {
      if (content.startsWith(OPEN, index)) {
        depth += 1;
        index += OPEN.length;
        continue;
      }
      if (content.startsWith(CLOSE, index)) {
        depth -= 1;
        if (depth === 0) {
          return { valueStart, valueEnd: index, value: content.slice(valueStart, index) };
        }
        index += CLOSE.length;
        continue;
      }
      index += 1;
    }
    return void 0;
  }
  function readSetvar(content, variable) {
    return locateSetvar(content, variable)?.value;
  }
  function replaceSetvar(content, variable, value) {
    const location = locateSetvar(content, variable);
    if (!location) {
      return void 0;
    }
    return content.slice(0, location.valueStart) + value + content.slice(location.valueEnd);
  }
  function compile(pattern, flags = "") {
    const required = `${flags.replace(/[dg]/g, "")}dg`;
    return new RegExp(pattern, required);
  }
  function locateCapture(content, pattern, flags) {
    let regex;
    try {
      regex = compile(pattern, flags);
    } catch {
      return void 0;
    }
    const matches = [...content.matchAll(regex)];
    if (matches.length !== 1) {
      return void 0;
    }
    const match = matches[0];
    const indices = match.indices?.[1];
    if (!indices || match[1] === void 0) {
      return void 0;
    }
    return { valueStart: indices[0], valueEnd: indices[1], value: match[1] };
  }
  function readCapture(content, pattern, flags) {
    return locateCapture(content, pattern, flags)?.value;
  }
  function replaceCapture(content, pattern, value, flags) {
    const location = locateCapture(content, pattern, flags);
    if (!location) {
      return void 0;
    }
    return content.slice(0, location.valueStart) + value + content.slice(location.valueEnd);
  }
  function validateMacroBalance(value) {
    let depth = 0;
    let index = 0;
    while (index < value.length) {
      if (value.startsWith(OPEN, index)) {
        depth += 1;
        index += OPEN.length;
        continue;
      }
      if (value.startsWith(CLOSE, index)) {
        depth -= 1;
        if (depth < 0) {
          return { ok: false, reason: "unbalanced-close" };
        }
        index += CLOSE.length;
        continue;
      }
      index += 1;
    }
    return depth === 0 ? { ok: true } : { ok: false, reason: "unbalanced-open" };
  }
  function describeMacroProblem(reason) {
    return reason === "unbalanced-close" ? "有多余的 }}，请检查花括号是否配对。" : "有未闭合的 {{，请检查花括号是否配对。";
  }
  function locateAppend(content, spec) {
    const beforeMatches = content.split(spec.before).length - 1;
    if (beforeMatches !== 1) {
      return void 0;
    }
    const end = content.indexOf(spec.before);
    const markerMatches = content.split(spec.marker).length - 1;
    if (markerMatches > 1) {
      return void 0;
    }
    if (markerMatches === 0) {
      return { start: end, end, value: "" };
    }
    const marker = content.indexOf(spec.marker);
    if (marker > end) {
      return void 0;
    }
    return {
      start: marker,
      end,
      value: content.slice(marker + spec.marker.length, end).replace(/^\n/, "").replace(/\n$/, "")
    };
  }
  function readAppended(content, spec) {
    return locateAppend(content, spec)?.value;
  }
  function replaceAppended(content, spec, value) {
    const span = locateAppend(content, spec);
    if (!span) {
      return void 0;
    }
    const prefix = spec.linePrefix ?? "";
    const lines = value.split("\n").map((line2) => line2.trim()).filter((line2) => line2 !== "").map((line2) => prefix && !line2.startsWith(prefix) ? prefix + line2 : line2);
    const head = content.slice(0, span.start);
    const tail = content.slice(span.end);
    if (lines.length === 0) {
      return head + tail;
    }
    return `${head}${spec.marker}
${lines.join("\n")}
${tail}`;
  }
  const EXTRA_ID_KEY = "kemini.id";
  function readField(content, field) {
    if (field.wholeContent) {
      return content;
    }
    if (field.appendTo) {
      return readAppended(content, field.appendTo);
    }
    return field.pattern ? readCapture(content, field.pattern.source, field.pattern.flags) : readSetvar(content, field.name);
  }
  function writeField(content, field, value) {
    if (field.wholeContent) {
      return value;
    }
    if (field.appendTo) {
      return replaceAppended(content, field.appendTo, value);
    }
    return field.pattern ? replaceCapture(content, field.pattern.source, value, field.pattern.flags) : replaceSetvar(content, field.name, value);
  }
  function validateFieldValue(field, value) {
    switch (field.kind) {
      case "integer":
        if (!/^\d+$/.test(value.trim())) {
          return { ok: false, message: "请填写纯数字。" };
        }
        if (Number(value.trim()) <= 0) {
          return { ok: false, message: "请填写大于 0 的数字。" };
        }
        return { ok: true };
      case "block":
        if (value.trim() === "") {
          return { ok: false, message: "不能留空，否则这条提示词会变成空的。" };
        }
        return { ok: true };
      case "line":
        if (value.includes("\n")) {
          return { ok: false, message: "只能填写一行文字。" };
        }
        if (/[{}]/.test(value)) {
          return { ok: false, message: "不能包含花括号，否则会破坏相邻的宏。" };
        }
        if (value.trim() === "") {
          return { ok: false, message: "不能留空。" };
        }
        return { ok: true };
      default: {
        const balance = validateMacroBalance(value);
        return balance.ok ? { ok: true } : { ok: false, message: describeMacroProblem(balance.reason) };
      }
    }
  }
  class PresetService {
    // ---------------------------------------------------------------------------------
    // Reading
    // ---------------------------------------------------------------------------------
    getCurrentPreset() {
      return adapter.getCurrentPreset();
    }
    getLoadedPresetName() {
      return adapter.getLoadedPresetName();
    }
    /**
     * Decide whether the in-use preset is the one this panel belongs to.
     *
     * Name matching alone is too brittle (users rename presets), so a registered prompt
     * resolving inside the preset also counts as proof.
     */
    validateCurrentPreset() {
      if (!adapter.isAvailable()) {
        return { status: "unavailable", reason: "TavernHelper 接口不可用" };
      }
      const preset = this.getCurrentPreset();
      if (!preset) {
        return { status: "unavailable", reason: "无法读取当前预设" };
      }
      const presetName = this.getLoadedPresetName();
      const lowered = (presetName ?? "").toLowerCase();
      if (presetName && presetIdentity.namePatterns.some((pattern) => lowered.includes(pattern))) {
        return { status: "ok", presetName, matchedBy: "name" };
      }
      {
        const anyResolved = configurablePrompts.some(
          (definition) => this.locate(preset, definition) !== void 0
        );
        if (anyResolved) {
          return { status: "ok", presetName: presetName ?? "(未命名)", matchedBy: "prompts" };
        }
      }
      return presetName ? { status: "unmatched", presetName } : { status: "unmatched" };
    }
    /**
     * Locate a registered prompt inside a preset.
     *
     * Resolution order (first hit wins), from most to least robust:
     *   1. `extra['kemini.id']`  — survives renames and id regeneration
     *   2. `id`
     *   3. `[KEMINI:…]` marker inside the name
     *   4. exact name match
     *
     * Searches the active `prompts` list first; a hit found only in `prompts_unused` is
     * reported separately, because a prompt in the unused pool is not part of the request
     * at all and flipping `enabled` on it would silently do nothing.
     */
    findPromptByStableId(stableId, preset = this.getCurrentPreset()) {
      if (!preset) return void 0;
      const definition = configurablePrompts.find((entry) => entry.stableId === stableId);
      if (!definition) return void 0;
      return this.locate(preset, definition);
    }
    locate(preset, definition) {
      const active = Array.isArray(preset.prompts) ? preset.prompts : [];
      const unused = Array.isArray(preset.prompts_unused) ? preset.prompts_unused : [];
      const inActive = matchIn(active, definition);
      if (inActive) return { prompt: inActive, listed: true };
      const inUnused = matchIn(unused, definition);
      if (inUnused) return { prompt: inUnused, listed: false };
      return void 0;
    }
    getPromptEnabled(stableId) {
      return this.findPromptByStableId(stableId)?.prompt.enabled;
    }
    // ---------------------------------------------------------------------------------
    // Diffing
    // ---------------------------------------------------------------------------------
    /**
     * Compare the actions against the live preset without writing anything.
     *
     * This is what the review screen renders, so the user confirms a real diff rather than
     * a restatement of their answers.
     */
    calculateChanges(actions) {
      const preset = this.getCurrentPreset();
      const changes = [];
      const unchanged = [];
      const missing = [];
      const variableChanges = [];
      const regexChanges = [];
      const invalid = [];
      for (const action of actions) {
        if (action.type === "setRegexEnabled") {
          const located2 = preset ? findRegex(preset, action.regexId) : void 0;
          const label = regexDisplayName(action.regexId);
          if (!located2) {
            missing.push({ stableId: action.regexId, displayName: label, reason: "not-found" });
            continue;
          }
          if (located2.enabled !== action.enabled) {
            regexChanges.push({
              stableId: action.regexId,
              displayName: label,
              from: located2.enabled === true,
              to: action.enabled
            });
          }
          continue;
        }
        const displayName = displayNameForStableId(action.promptId);
        const definition = configurablePrompts.find(
          (entry) => entry.stableId === action.promptId
        );
        const located = preset && definition ? this.locate(preset, definition) : void 0;
        if (!located && definition?.pending && preset) {
          if (action.type === "setPromptEnabled" && !action.enabled) {
            continue;
          }
          missing.push({ stableId: action.promptId, displayName, reason: "not-found" });
          continue;
        }
        if (!located && definition?.createFrom && preset) {
          if (action.type === "setPromptEnabled") {
            if (!action.enabled) {
              continue;
            }
            changes.push({
              stableId: action.promptId,
              displayName,
              ...definition.description ? { description: definition.description } : {},
              from: false,
              to: true
            });
          } else {
            const field2 = definition.variables?.find((entry) => entry.name === action.variable);
            const fieldName2 = field2?.displayName ?? action.variable;
            const validation2 = field2 ? validateFieldValue(field2, action.value) : { ok: false, message: "未声明的字段" };
            if (!validation2.ok) {
              invalid.push({ displayName: fieldName2, message: validation2.message });
            } else {
              const seed = readField(definition.createFrom.initialContent, field2) ?? "";
              if (seed !== action.value) {
                variableChanges.push({
                  stableId: action.promptId,
                  variable: action.variable,
                  displayName: fieldName2,
                  from: seed,
                  to: action.value
                });
              }
            }
          }
          continue;
        }
        if (!located) {
          missing.push({ stableId: action.promptId, displayName, reason: "not-found" });
          continue;
        }
        if (!located.listed) {
          missing.push({ stableId: action.promptId, displayName, reason: "unlisted" });
          continue;
        }
        if (action.type === "setPromptEnabled") {
          const change = {
            stableId: action.promptId,
            displayName,
            ...definition?.description ? { description: definition.description } : {},
            from: located.prompt.enabled === true,
            to: action.enabled
          };
          (change.from === change.to ? unchanged : changes).push(change);
          continue;
        }
        const field = definition?.variables?.find((entry) => entry.name === action.variable);
        const fieldName = field?.displayName ?? action.variable;
        const current = field ? readField(located.prompt.content ?? "", field) : void 0;
        if (current === void 0) {
          missing.push({
            stableId: action.promptId,
            displayName: fieldName,
            reason: "not-found"
          });
          continue;
        }
        const validation = validateFieldValue(field, action.value);
        if (!validation.ok) {
          invalid.push({ displayName: fieldName, message: validation.message });
          continue;
        }
        if (current !== action.value) {
          variableChanges.push({
            stableId: action.promptId,
            variable: action.variable,
            displayName: fieldName,
            from: current,
            to: action.value
          });
        }
      }
      return { changes, variableChanges, regexChanges, missing, unchanged, invalid };
    }
    /**
     * Create an on-demand prompt if it is not already there.
     *
     * The clone copies the template's metadata wholesale rather than reconstructing it, so
     * the new prompt round-trips through TavernHelper exactly like its siblings. Only `id`,
     * `name`, `enabled` and `content` are overridden.
     *
     * Idempotent: if the prompt already exists, nothing happens — this runs on every apply.
     */
    ensureCreated(preset, definition) {
      if (!definition.createFrom || this.locate(preset, definition)) {
        return;
      }
      const spec = definition.createFrom;
      const templatePrompt = resolveRef(preset, spec.template);
      if (!templatePrompt || !Array.isArray(preset.prompts)) {
        eventLog.warn(`cannot create ${definition.displayName}: template prompt not found`);
        return;
      }
      const created = {
        ...structuredClone(templatePrompt),
        id: definition.stableId,
        name: spec.name,
        enabled: false,
        // The enable action later in the same pass decides this.
        content: spec.initialContent
      };
      delete created.extra;
      const anchorRef = spec.insertBefore ?? spec.insertAfter;
      const anchorPrompt = anchorRef ? resolveRef(preset, anchorRef) : void 0;
      const anchorIndex = anchorPrompt ? preset.prompts.indexOf(anchorPrompt) : -1;
      if (anchorIndex < 0) {
        eventLog.warn(`cannot create ${definition.displayName}: anchor prompt not found`);
        return;
      }
      preset.prompts.splice(spec.insertBefore ? anchorIndex : anchorIndex + 1, 0, created);
      eventLog.info(`created prompt "${spec.name}" in the in-use preset`);
    }
    /**
     * Whether a registered prompt is actually present and usable in the preset right now.
     *
     * Used to hide wizard options for reserved slots: offering a choice that resolves to
     * nothing is worse than not offering it.
     */
    hasPrompt(registryKey) {
      const definition = configurablePrompts.find((entry) => entry.key === registryKey);
      if (!definition) return false;
      const preset = this.getCurrentPreset();
      if (!preset) return false;
      return this.locate(preset, definition)?.listed === true;
    }
    /** Current text inside a registered prompt's `{{setvar::variable::…}}`. */
    readPromptVariable(stableId, variable) {
      const definition = configurablePrompts.find((entry) => entry.stableId === stableId);
      const field = definition?.variables?.find((entry) => entry.name === variable);
      if (!field) {
        return void 0;
      }
      const located = this.findPromptByStableId(stableId);
      if (!located) return void 0;
      return readField(located.prompt.content ?? "", field);
    }
    // ---------------------------------------------------------------------------------
    // Writing
    // ---------------------------------------------------------------------------------
    /**
     * Apply the actions to the in-use preset in a single write.
     *
     * Scope of the write, deliberately narrow:
     *   · `enabled`, on registry-resolved prompts only;
     *   · the value span of a `{{setvar::…}}` whose variable is declared editable on that
     *     registry entry.
     *
     * Prompt order, position, role, every other byte of content (including the author's
     * `{{// …}}` comments) and every unregistered prompt are left exactly as they were.
     *
     * A partial result is a normal outcome, not a failure: if one target is missing the rest
     * still apply, and the caller reports what did not land.
     */
    async applyActions(actions) {
      const { changes, variableChanges, regexChanges, missing, unchanged, invalid } = this.calculateChanges(actions);
      const toApply = [...changes, ...unchanged];
      if (toApply.length === 0 && variableChanges.length === 0 && regexChanges.length === 0) {
        return {
          applied: [],
          appliedVariables: [],
          appliedRegexes: [],
          missing,
          invalid,
          persistence: { status: "skipped", reason: "没有需要写入的修改" }
        };
      }
      const desiredEnabled = new Map(toApply.map((change) => [change.stableId, change.to]));
      const desiredVariables = new Map(
        variableChanges.map((change) => [`${change.stableId}::${change.variable}`, change.to])
      );
      const needsCreation = new Set(
        [...toApply.filter((change) => change.to), ...variableChanges].map((change) => change.stableId)
      );
      const desiredRegexes = new Map(regexChanges.map((change) => [change.stableId, change.to]));
      const mutate = (preset) => {
        for (const [regexId, enabled] of desiredRegexes) {
          const regex = findRegex(preset, regexId);
          if (regex) {
            regex.enabled = enabled;
          }
        }
        for (const definition of configurablePrompts) {
          if (definition.createFrom && needsCreation.has(definition.stableId)) {
            this.ensureCreated(preset, definition);
          }
          const located = this.locate(preset, definition);
          if (!located?.listed) {
            continue;
          }
          if (desiredEnabled.has(definition.stableId)) {
            located.prompt.enabled = desiredEnabled.get(definition.stableId) === true;
          }
          for (const variable of definition.variables ?? []) {
            const key = `${definition.stableId}::${variable.name}`;
            if (!desiredVariables.has(key)) continue;
            const rewritten = writeField(
              located.prompt.content ?? "",
              variable,
              desiredVariables.get(key)
            );
            if (rewritten !== void 0) {
              located.prompt.content = rewritten;
            }
          }
        }
        return preset;
      };
      try {
        await adapter.updateCurrentPreset(mutate);
      } catch (error) {
        const wrapped = error instanceof Error ? error : new Error(String(error));
        eventLog.error("preset apply failed", wrapped.message);
        return {
          applied: [],
          appliedVariables: [],
          appliedRegexes: [],
          missing,
          invalid,
          persistence: { status: "skipped", reason: "应用失败，未写入预设文件" },
          error: wrapped
        };
      }
      if (regexChanges.length > 0) {
        await adapter.reloadChatDisplay();
      }
      const persistence = await this.persistToPresetFile(mutate);
      eventLog.info(
        `config applied (${changes.length} toggled, ${variableChanges.length} text edited, ${regexChanges.length} regex toggled, ${unchanged.length} already correct, ${missing.length} missing, ${invalid.length} invalid, persistence=${persistence.status})`
      );
      return {
        applied: changes,
        appliedVariables: variableChanges,
        appliedRegexes: regexChanges,
        missing,
        invalid,
        persistence
      };
    }
    /**
     * Also write the change into the saved preset file, so it survives a preset switch.
     *
     * Writing only to `'in_use'` lives in `oai_settings`; SillyTavern reloads that from the
     * preset file whenever the user switches preset and back, silently reverting everything
     * the panel did. Persisting closes that gap.
     *
     * Guards, because this touches a file the user owns:
     *   · disabled entirely when the user turns auto-save off;
     *   · never writes unless the in-use preset is confirmed to be OURS — writing our prompt
     *     toggles into an unrelated preset would be a genuine act of vandalism;
     *   · a failure here is reported, never thrown: the in-use write already succeeded, so
     *     the configuration IS active, it just is not saved.
     */
    async persistToPresetFile(mutate) {
      if (!settingsStore.autoSaveToPresetFile) {
        return { status: "disabled" };
      }
      const presetName = this.getLoadedPresetName();
      if (!presetName) {
        return { status: "skipped", reason: "无法确定当前预设的名称" };
      }
      if (!adapter.getPresetNames().includes(presetName)) {
        return { status: "skipped", reason: `预设「${presetName}」不在酒馆的预设列表中` };
      }
      const validation = this.validateCurrentPreset();
      if (validation.status !== "ok") {
        return { status: "skipped", reason: "当前预设不是本面板对应的预设，未写入文件" };
      }
      try {
        await adapter.updateNamedPreset(presetName, mutate);
        eventLog.info(`config saved into preset file "${presetName}"`);
        return { status: "saved", presetName };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        eventLog.warn(`saving into preset file failed: ${message}`);
        return { status: "failed", reason: message };
      }
    }
  }
  function findRegex(preset, stableId) {
    const scripts = preset.extensions?.regex_scripts;
    if (!Array.isArray(scripts)) return void 0;
    const byId = scripts.find((entry) => entry?.id === stableId);
    if (byId) return byId;
    const definition = configurableRegexes.find((entry) => entry.stableId === stableId);
    const names = new Set((definition?.nameFallbacks ?? []).map(normaliseName));
    return names.size > 0 ? scripts.find((entry) => typeof entry?.script_name === "string" && names.has(normaliseName(entry.script_name))) : void 0;
  }
  function resolveRef(preset, ref) {
    const active = Array.isArray(preset.prompts) ? preset.prompts : [];
    return matchIn(active, ref);
  }
  function matchIn(prompts, definition) {
    const byExtra = prompts.find(
      (prompt) => prompt?.extra?.[EXTRA_ID_KEY] === definition.stableId
    );
    if (byExtra) return byExtra;
    const byId = prompts.find((prompt) => prompt?.id === definition.stableId);
    if (byId) return byId;
    if (definition.marker) {
      const marker = definition.marker;
      const byMarker = prompts.find(
        (prompt) => typeof prompt?.name === "string" && prompt.name.includes(marker)
      );
      if (byMarker) return byMarker;
    }
    if (definition.nameFallbacks?.length) {
      const names = new Set(definition.nameFallbacks.map(normaliseName));
      const byName = prompts.find(
        (prompt) => typeof prompt?.name === "string" && names.has(normaliseName(prompt.name))
      );
      if (byName) return byName;
    }
    return void 0;
  }
  const VARIATION_SELECTORS = /[\uFE0E\uFE0F]/g;
  const INVISIBLES = /[\u200B\u200C\u200D\uFEFF]/g;
  function normaliseName(name) {
    return name.normalize("NFC").replace(VARIATION_SELECTORS, "").replace(INVISIBLES, "").replace(/\s+/g, " ").trim();
  }
  const presetService = new PresetService();
  class PassiveGenerationWatcher {
    disposers = [];
    active = false;
    sawMessage = false;
    userStopped = false;
    startedAt = 0;
    /** Generation types that end without adding a chat message even when they succeed. */
    static IGNORED_TYPES = /* @__PURE__ */ new Set(["impersonate", "quiet"]);
    start() {
      if (this.disposers.length > 0) {
        return;
      }
      const started = adapter.eventName("tavern", "GENERATION_STARTED");
      const ended = adapter.eventName("tavern", "GENERATION_ENDED");
      const received = adapter.eventName("tavern", "MESSAGE_RECEIVED");
      const stopped = adapter.eventName("tavern", "GENERATION_STOPPED");
      if (!started || !ended || !received) {
        eventLog.warn("passive watcher: required tavern events unavailable, not started");
        return;
      }
      this.disposers.push(
        adapter.listenEvent(started, (...args) => {
          const type = typeof args[0] === "string" ? args[0] : "";
          const dryRun = args[2] === true;
          if (dryRun || PassiveGenerationWatcher.IGNORED_TYPES.has(type)) {
            this.active = false;
            return;
          }
          this.active = true;
          this.sawMessage = false;
          this.userStopped = false;
          this.startedAt = Date.now();
        })
      );
      this.disposers.push(
        adapter.listenEvent(received, () => {
          this.sawMessage = true;
        })
      );
      if (stopped) {
        this.disposers.push(
          adapter.listenEvent(stopped, () => {
            this.userStopped = true;
          })
        );
      }
      this.disposers.push(
        adapter.listenEvent(ended, () => {
          if (!this.active) {
            return;
          }
          this.active = false;
          if (this.sawMessage || this.userStopped) {
            return;
          }
          if (diagnosticStore.hasRecentObservedFailure()) {
            eventLog.debug("passive watcher: real error already captured, skipping inference");
            return;
          }
          diagnosticStore.recordObservedFailure({
            timestamp: Date.now(),
            confidence: "inferred",
            message: "检测到一次聊天生成没有产生回复。SillyTavern 没有向扩展提供这次失败的具体原因，请运行一次生成诊断以获取完整的 HTTP 状态与服务器返回信息。",
            ...adapter.getCurrentProviderLabel() ? { provider: adapter.getCurrentProviderLabel() } : {},
            ...adapter.getCurrentModel() ? { model: adapter.getCurrentModel() } : {}
          });
          eventLog.warn(
            `passive watcher: generation ended with no message after ${Date.now() - this.startedAt} ms`
          );
        })
      );
      eventLog.info("passive generation watcher started");
    }
    dispose() {
      for (const dispose of this.disposers) {
        try {
          dispose();
        } catch (error) {
          eventLog.warn("passive watcher: dispose failed", error);
        }
      }
      this.disposers = [];
      this.active = false;
    }
  }
  const passiveWatcher = new PassiveGenerationWatcher();
  const onboardingContent = profile.onboardingContent;
  const dashboardContent = profile.dashboardContent;
  const diagnosticsContent = {
    /**
     * The honesty notice attached to every diagnostic run.
     *
     * This wording is load-bearing. The run really does use the current preset, chat, character,
     * worldbook, provider and model — but it goes through TavernHelper's generation path rather
     * than SillyTavern's own `Generate()`, so it is "very close to", not "identical to", pressing
     * Continue. Overstating that would make a green result actively misleading.
     */
    fidelityNote: `诊断使用当前预设、当前聊天记录、当前角色与当前模型发起一次真实的生成请求，
但它走的是酒馆助手的生成通道，而不是酒馆自己的 Continue。绝大多数配置与兼容性问题都能复现，
少数只在酒馆原生 Continue 流程中出现的问题可能测不到。

诊断不会向聊天中写入任何消息。`,
    reducedFidelityNote: `当前环境只能进行简化诊断，结果与真实生成并不等价。`,
    unavailableNote: `当前环境暂不支持主动生成诊断。`,
    /** Explains why a failure has no detail, when SillyTavern discarded the body. */
    bodyUnavailableHint: `SillyTavern 在这条错误路径上没有保留服务器返回的内容，
因此这里只能显示 HTTP 状态码。完整的服务器信息通常会出现在酒馆右上角的弹出提示中。`
  };
  function line(label, value) {
    const text = value === void 0 || value === null || value === "" ? "Unknown" : String(value);
    return `${label}:
${text}
`;
  }
  function formatTime(timestamp) {
    const date = new Date(timestamp);
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }
  function buildDiagnosticReport(result) {
    const environment = result?.environment;
    const answers = settingsStore.getAnswers();
    const sections = [];
    sections.push("Kemini Diagnostics\n");
    sections.push(line("Time", formatTime(result?.timestamp ?? Date.now())));
    sections.push(line("Panel Version", PANEL_VERSION));
    sections.push(line("Preset", environment?.presetName));
    sections.push(line("Preset Version", environment?.presetVersion));
    sections.push(line("SillyTavern", environment?.sillyTavernVersion));
    sections.push(line("TavernHelper", environment?.tavernHelperVersion));
    sections.push(line("Provider", environment?.provider));
    sections.push(line("Model", environment?.model));
    sections.push(line("Online Status", environment?.onlineStatus));
    if (typeof environment?.chatLength === "number") {
      sections.push(line("Chat Messages", environment.chatLength));
    }
    sections.push("\n--- Configuration ---\n");
    for (const [questionId, value] of Object.entries(answers)) {
      sections.push(line(questionId, describeAnswer(questionId, value)));
    }
    sections.push("\n--- Generation Test ---\n");
    if (!result) {
      sections.push(line("Generation Test", "NOT RUN"));
    } else {
      sections.push(line("Generation Test", result.success ? "SUCCESS" : "FAILED"));
      sections.push(line("Generation Mode", describeFidelity(result)));
      sections.push(line("Duration", `${(result.durationMs / 1e3).toFixed(1)} s`));
      if (result.success) {
        sections.push(line("Response Length", `${result.responseLength ?? 0} characters`));
      }
      const error = result.error;
      if (error) {
        sections.push(line("HTTP Status", error.httpStatus));
        sections.push(line("Code", error.code));
        sections.push(line("Type", error.type));
        sections.push(line("Source", error.source));
        sections.push(line("Message", error.message));
        if (error.providerMessage && error.providerMessage !== error.message) {
          sections.push(line("Provider Message", error.providerMessage));
        }
        if (error.bodyUnavailable) {
          sections.push(
            line(
              "Note",
              "SillyTavern discarded the response body on this path; only the status code is recoverable."
            )
          );
        }
      }
      sections.push("\n--- Steps ---\n");
      for (const step of result.steps) {
        sections.push(`${statusGlyph(step.status)} ${step.label}${step.note ? ` — ${step.note}` : ""}
`);
      }
    }
    sections.push("\n--- Event Log ---\n");
    sections.push(eventLog.format(40));
    sections.push("\n");
    return sanitizeString(sections.join(""));
  }
  function describeFidelity(result) {
    switch (result.fidelity) {
      case "preset-pipeline":
        return "preset-pipeline (current preset + current chat, non-streaming, via TavernHelper)";
      case "reduced":
        return "reduced (NOT equivalent to a normal generation)";
      default:
        return "unavailable";
    }
  }
  function statusGlyph(status) {
    switch (status) {
      case "ok":
        return "✓";
      case "failed":
        return "✕";
      case "unavailable":
        return "○";
      case "running":
        return "…";
      default:
        return "·";
    }
  }
  const diagnosticsProbe = {
    /**
     * The user turn appended for the probe.
     *
     * Why not empty: TavernHelper always appends a user message
     * (generate.ts:34-48 `oaiMessages.unshift(userMessageTemp)`), and an empty `content` is
     * itself rejected by some providers — that would produce a diagnostic failure caused by
     * the diagnostic rather than by the user's configuration.
     *
     * Why not "hello": everything else in the request is real — the full preset, the real
     * chat history, the real character, the real worldbook, the real samplers. Only this one
     * short turn is synthetic.
     */
    userInput: "（继续）",
    /**
     * Cap on reply tokens.
     *
     * `undefined` = use the preset's own `max_completion_tokens`, i.e. a fully faithful
     * request. Set a number for a cheaper/faster probe, at the cost of possibly missing
     * context-overflow errors, which depend on input tokens PLUS the reply budget.
     */
    maxTokens: void 0,
    /**
     * Non-streaming is deliberate.
     *
     * TavernHelper's streaming wrapper stringifies the cause
     * (responseGenerator.ts:161 `throw Error("Generate method error: " + err)`), which
     * destroys the structured provider error. Non-streaming keeps `HTTP <status>: <body>`
     * intact, and the body is the whole point of the diagnostic.
     */
    stream: false,
    /** Abort the probe after this long so a hung provider cannot wedge the UI. */
    timeoutMs: 12e4
  };
  const CORE_INJECTOR_BASES = [
    "__STORY_STRING__",
    "QUIET_PROMPT",
    "DEPTH_PROMPT",
    // character card depth prompt, plus DEPTH_PROMPT_<index>
    "customDepthWI",
    // world info at depth
    "customWIOutlet",
    // world info outlets
    "PERSONA_DESCRIPTION",
    "2_floating_prompt",
    // author's note
    "INJECTION",
    // TavernHelper inject identifiers
    "TH-CustomInjects"
    // TavernHelper `injects` option
  ];
  function matchesBase(key, base) {
    return key === base || key.startsWith(`${base}-`) || key.startsWith(`${base}_`);
  }
  const CONTEXT_INJECTOR_KEYS = /* @__PURE__ */ new Set([
    "1_memory",
    "vectors",
    "3_vectors",
    "4_vectors_data_bank",
    "chromadb",
    "smart_context"
  ]);
  function classifyInjector(key) {
    if (CORE_INJECTOR_BASES.some((base) => matchesBase(key, base))) {
      return "core";
    }
    return CONTEXT_INJECTOR_KEYS.has(key) ? "context" : "unknown";
  }
  class PromptStructureInspector {
    before;
    after;
    finalPayload;
    disposers = [];
    /**
     * Start listening. Call immediately before triggering a generation, and `stop()` after.
     *
     * The PROMPT_READY listener is registered with `eventMakeFirst` so it observes the array
     * as the preset built it, ahead of any extension that also listens.
     */
    start() {
      this.stop();
      this.before = void 0;
      this.after = void 0;
      this.finalPayload = void 0;
      const promptReady = adapter.eventName("tavern", "CHAT_COMPLETION_PROMPT_READY");
      const settingsReady = adapter.eventName("tavern", "CHAT_COMPLETION_SETTINGS_READY");
      if (promptReady) {
        this.disposers.push(
          adapter.listenEventFirst(promptReady, (...args) => {
            const data = args[0];
            if (data?.dryRun) return;
            this.before = Array.isArray(data?.chat) ? [...data.chat] : void 0;
          })
        );
      }
      if (settingsReady) {
        this.disposers.push(
          adapter.listenEvent(settingsReady, (...args) => {
            const data = args[0];
            if (!data) return;
            this.finalPayload = data;
            const messages = data["messages"];
            this.after = Array.isArray(messages) ? [...messages] : void 0;
          })
        );
      }
    }
    stop() {
      for (const dispose of this.disposers) {
        try {
          dispose();
        } catch {
        }
      }
      this.disposers = [];
    }
    /** Analyse whatever was captured. Safe to call even if nothing was. */
    report() {
      const findings = [];
      const injectors = this.collectInjectors();
      const describe2 = (entry) => `${entry.key}（${entry.length} 字${entry.depth !== void 0 ? `，depth ${entry.depth}` : ""}）`;
      const contextual = injectors.filter((entry) => entry.kind === "context");
      if (contextual.length > 0) {
        findings.push({
          id: "context-extension-injection",
          severity: "warning",
          title: `有 ${contextual.length} 个扩展正在向提示词额外注入内容`,
          detail: contextual.map(describe2).join("、") + "。这类扩展会把检索到的内容塞进提示词，可能干扰预设结构。破甲失败或格式异常时，先关掉它们再试。"
        });
      }
      const unknown = injectors.filter((entry) => entry.kind === "unknown");
      if (unknown.length > 0) {
        findings.push({
          id: "unknown-extension-injection",
          severity: "warning",
          title: `有 ${unknown.length} 个第三方扩展正在向提示词注入内容`,
          detail: unknown.map(describe2).join("、") + "。这些不是酒馆自带的机制。如果破甲失败或格式异常，先关掉它们再试。"
        });
      }
      const prefill = this.detectUnexpectedPrefill();
      if (prefill) {
        findings.push(prefill);
      }
      if (this.before && this.after && this.after.length !== this.before.length) {
        const delta = this.after.length - this.before.length;
        findings.push({
          id: "message-count-changed",
          severity: "error",
          title: "提示词结构被修改",
          detail: `预设组装完成时有 ${this.before.length} 条消息，实际发送时变成了 ${this.after.length} 条（${delta > 0 ? "多出" : "少了"} ${Math.abs(delta)} 条）。说明有插件在预设之后改动了提示词。请关闭依赖预填充的插件后重新诊断。`
        });
      }
      const tools = this.finalPayload?.["tools"];
      if (Array.isArray(tools) && tools.length > 0) {
        findings.push({
          id: "unexpected-tools",
          severity: "error",
          title: "请求里带上了工具定义（tools）",
          detail: `发送体中有 ${tools.length} 个工具定义。本预设建议提示词后处理选「严格（不带工具）」，并关闭函数调用。带工具会明显影响破甲。`
        });
      }
      const postProcessing = this.detectPostProcessing();
      if (postProcessing) {
        findings.push(postProcessing);
      }
      return {
        findings,
        injectors,
        ...this.before ? { messagesBefore: this.before.length } : {},
        ...this.after ? { messagesAfter: this.after.length } : {},
        observed: this.after !== void 0 || injectors.length > 0
      };
    }
    collectInjectors() {
      const prompts = adapter.getExtensionPrompts();
      if (!prompts) return [];
      const result = [];
      for (const [key, entry] of Object.entries(prompts)) {
        if (!entry || typeof entry !== "object") continue;
        const value = entry.value;
        const text = typeof value === "string" ? value : "";
        if (text.trim() === "") continue;
        const position = entry.position;
        const depth = entry.depth;
        result.push({
          key,
          length: text.length,
          ...typeof position === "number" ? { position } : {},
          ...typeof depth === "number" ? { depth } : {},
          kind: classifyInjector(key)
        });
      }
      return result.sort((a, b) => b.length - a.length);
    }
    /**
     * A trailing `assistant` message that nobody asked for.
     *
     * SillyTavern only adds one deliberately via `assistant_prefill` (Claude) or a `continue`
     * generation. The diagnostic is neither, so a trailing assistant turn means something
     * else put it there — the classic symptom of a prefill-style plugin.
     */
    detectUnexpectedPrefill() {
      const messages = this.after;
      if (!messages?.length) return void 0;
      const last = messages[messages.length - 1];
      if (last?.role !== "assistant") return void 0;
      const settings = adapter.getChatCompletionSettings();
      const configured = settings?.["assistant_prefill"];
      if (typeof configured === "string" && configured.trim() !== "") {
        return void 0;
      }
      const preview = typeof last.content === "string" ? last.content.length : 0;
      return {
        id: "unexpected-prefill",
        severity: "error",
        title: "检测到本不该存在的 prefill 结构",
        detail: `发送给模型的最后一条消息是 assistant 角色（${preview} 字），但酒馆的 assistant 前缀设置是空的，本次也不是续写。这通常来自依赖预填充的插件。请关闭它们后重新诊断。`
      };
    }
    detectPostProcessing() {
      const settings = adapter.getChatCompletionSettings();
      if (!settings) return void 0;
      if (settings["chat_completion_source"] !== "custom") return void 0;
      const value = settings["custom_prompt_post_processing"];
      if (value === "strict") return void 0;
      const label = typeof value === "string" && value ? value : "(未设置)";
      return {
        id: "post-processing",
        severity: "warning",
        title: "提示词后处理不是「严格（不带工具）」",
        detail: `当前是 ${label}。本预设建议选择 strict（严格，不带工具）。`
      };
    }
  }
  const promptStructureInspector = new PromptStructureInspector();
  function worstSeverity(findings) {
    if (findings.some((entry) => entry.severity === "error")) return "error";
    if (findings.some((entry) => entry.severity === "warning")) return "warning";
    return findings.length > 0 ? "info" : void 0;
  }
  const STEPS = [
    { id: "preset", label: "检查当前预设" },
    { id: "prompts", label: "检查关键 Prompt" },
    { id: "provider", label: "获取当前 Provider" },
    { id: "model", label: "获取当前 Model" },
    { id: "prepare", label: "构造诊断生成环境" },
    { id: "request", label: "发起生成请求" },
    { id: "response", label: "等待模型响应" },
    { id: "structure", label: "检查提示词结构" }
  ];
  class GenerationDiagnosticsService {
    running = false;
    currentGenerationId;
    get isRunning() {
      return this.running;
    }
    /** Whether an active diagnostic is possible at all, for graceful degradation. */
    availability() {
      if (!adapter.canRunGeneration()) {
        return { fidelity: "unavailable", reason: "TavernHelper 的 generate 接口不可用" };
      }
      if (!adapter.getCurrentPreset()) {
        return { fidelity: "reduced", reason: "无法读取当前预设，诊断将不包含预设内容" };
      }
      return { fidelity: "preset-pipeline" };
    }
    collectEnvironment() {
      const snapshot = adapter.collectEnvironment();
      return {
        panelVersion: PANEL_VERSION,
        presetVersion: presetIdentity.presetVersion,
        ...snapshot.loadedPresetName ? { presetName: snapshot.loadedPresetName } : {},
        ...snapshot.provider ? { provider: snapshot.provider } : {},
        ...snapshot.model ? { model: snapshot.model } : {},
        ...snapshot.sillyTavernVersion ? { sillyTavernVersion: snapshot.sillyTavernVersion } : {},
        ...snapshot.tavernHelperVersion ? { tavernHelperVersion: snapshot.tavernHelperVersion } : {},
        ...typeof snapshot.chatLength === "number" ? { chatLength: snapshot.chatLength } : {},
        ...snapshot.characterName ? { characterName: snapshot.characterName } : {},
        ...snapshot.onlineStatus ? { onlineStatus: snapshot.onlineStatus } : {}
      };
    }
    /**
     * Execute the full diagnostic.
     *
     * Never throws: any failure — including a bug in this method — is turned into a failed
     * `DiagnosticResult`, because the diagnostics screen is precisely where the user goes
     * when things are already broken.
     */
    async run(onStep) {
      if (this.running) {
        throw new Error("诊断已在运行中");
      }
      this.running = true;
      const steps = STEPS.map((spec) => ({ ...spec, status: "pending" }));
      const notify = () => onStep?.(steps.map((step) => ({ ...step })));
      const set = (id, status, note) => {
        const step = steps.find((entry) => entry.id === id);
        if (step) {
          step.status = status;
          if (note !== void 0) step.note = note;
        }
        notify();
      };
      const startedAt = Date.now();
      const environment = this.collectEnvironment();
      let fidelity = "preset-pipeline";
      eventLog.info("generation diagnostic started");
      notify();
      try {
        set("preset", "running");
        const preset = presetService.getCurrentPreset();
        if (preset) {
          set("preset", "ok", environment.presetName ?? "已加载");
        } else {
          fidelity = "reduced";
          set("preset", "unavailable", "无法读取当前预设");
        }
        set("prompts", "running");
        if (preset) {
          const enabled = countManagedPrompts();
          set(
            "prompts",
            enabled.found > 0 ? "ok" : "unavailable",
            enabled.found > 0 ? `已登记 ${enabled.found} 项，其中启用 ${enabled.enabled} 项` : "未在预设中找到已登记的 Prompt"
          );
        } else {
          set("prompts", "unavailable", "无法读取");
        }
        set("provider", "running");
        set(
          "provider",
          environment.provider ? "ok" : "unavailable",
          environment.provider ?? "无法获取"
        );
        set("model", "running");
        set("model", environment.model ? "ok" : "unavailable", environment.model ?? "无法获取");
        set("prepare", "running");
        if (!adapter.canRunGeneration()) {
          set("prepare", "failed", "generate 接口不可用");
          return this.finish(
            {
              success: false,
              fidelity: "unavailable",
              environment,
              steps,
              startedAt,
              error: parseGenerationError(
                new Error("当前环境暂不支持主动生成诊断 (generate 不可用)")
              )
            },
            notify
          );
        }
        const generationId = `kemini-diagnostic-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
        this.currentGenerationId = generationId;
        const customApi = {};
        if (typeof diagnosticsProbe.maxTokens === "number") ;
        set(
          "prepare",
          "ok",
          diagnosticsProbe.stream ? "流式 · 使用当前预设" : "非流式 · 使用当前预设"
        );
        promptStructureInspector.start();
        set("request", "running");
        const responseText = await this.withTimeout(
          adapter.runGeneration({
            userInput: diagnosticsProbe.userInput,
            customApi,
            stream: diagnosticsProbe.stream,
            silent: true,
            maxChatHistory: "all",
            generationId
          }),
          diagnosticsProbe.timeoutMs,
          generationId
        );
        set("request", "ok");
        set("response", "ok", `${responseText.length} 字符`);
        const structure = this.collectStructure(set);
        return this.finish(
          {
            success: true,
            fidelity,
            environment,
            steps,
            startedAt,
            responseText,
            structure
          },
          notify
        );
      } catch (error) {
        const parsed = parseGenerationError(error);
        for (const step of steps) {
          if (step.status === "running") {
            step.status = "failed";
            step.note = parsed.httpStatus ? `HTTP ${parsed.httpStatus}` : parsed.message;
          }
        }
        notify();
        const structure = this.collectStructure(set);
        return this.finish(
          { success: false, fidelity, environment, steps, startedAt, error: parsed, structure },
          notify
        );
      } finally {
        promptStructureInspector.stop();
        this.running = false;
        this.currentGenerationId = void 0;
      }
    }
    /** Run the structure analysis and reflect its verdict on the step list. */
    collectStructure(set) {
      try {
        const structure = promptStructureInspector.report();
        if (!structure.observed) {
          set("structure", "unavailable", "无法获取发送结构");
          return structure;
        }
        const severity = worstSeverity(structure.findings);
        set(
          "structure",
          severity === "error" ? "failed" : "ok",
          severity === void 0 ? "未发现干扰" : `${structure.findings.length} 项问题`
        );
        return structure;
      } catch (error) {
        eventLog.warn("structure inspection failed", error);
        set("structure", "unavailable", "检查失败");
        return void 0;
      }
    }
    /** Stop an in-flight diagnostic. */
    cancel() {
      if (this.currentGenerationId) {
        adapter.stopGeneration(this.currentGenerationId);
        eventLog.info("generation diagnostic cancelled by user");
      }
    }
    async withTimeout(promise, timeoutMs, generationId) {
      let timer;
      try {
        return await Promise.race([
          promise,
          new Promise((_resolve, reject) => {
            timer = setTimeout(() => {
              adapter.stopGeneration(generationId);
              reject(new Error(`诊断超时：${Math.round(timeoutMs / 1e3)} 秒内没有收到响应`));
            }, timeoutMs);
          })
        ]);
      } finally {
        if (timer !== void 0) clearTimeout(timer);
      }
    }
    finish(input, notify) {
      const result = {
        id: `${input.startedAt}`,
        timestamp: input.startedAt,
        category: "generation",
        success: input.success,
        fidelity: input.fidelity,
        durationMs: Date.now() - input.startedAt,
        environment: input.environment,
        steps: input.steps.map((step) => ({ ...step })),
        ...input.responseText !== void 0 ? {
          responseLength: input.responseText.length,
          // Sanitised: a model reply can echo injected content.
          responseText: String(sanitizeDiagnosticData(input.responseText))
        } : {},
        ...input.error ? { error: input.error } : {},
        ...input.structure ? { structure: input.structure } : {}
      };
      diagnosticStore.recordResult(result);
      notify();
      return result;
    }
  }
  function countManagedPrompts() {
    let found = 0;
    let enabled = 0;
    for (const definition of configurablePrompts) {
      const located = presetService.findPromptByStableId(definition.stableId);
      if (located) {
        found += 1;
        if (located.prompt.enabled) enabled += 1;
      }
    }
    return { found, enabled };
  }
  const generationDiagnostics = new GenerationDiagnosticsService();
  let hostDocument = typeof document !== "undefined" ? document : void 0;
  function setHostDocument(doc) {
    hostDocument = doc;
  }
  function getHostDocument() {
    return hostDocument;
  }
  function el(tag, options = {}, ...children) {
    const node = hostDocument.createElement(tag);
    if (options.class) node.className = options.class;
    if (options.title) node.title = options.title;
    if (options.text !== void 0) node.textContent = String(options.text);
    if (options.attrs) {
      for (const [name, value] of Object.entries(options.attrs)) {
        if (value === void 0 || value === false) continue;
        node.setAttribute(name, value === true ? "" : String(value));
      }
    }
    if (options.style) {
      Object.assign(node.style, options.style);
    }
    if (options.on) {
      for (const [event, handler] of Object.entries(options.on)) {
        node.addEventListener(event, handler);
      }
    }
    append(node, ...children);
    return node;
  }
  function append(parent, ...children) {
    for (const child of children) {
      if (child === null || child === void 0 || child === false) continue;
      parent.appendChild(
        typeof child === "string" || typeof child === "number" ? hostDocument.createTextNode(String(child)) : child
      );
    }
  }
  function clear(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }
  function paragraphs(text, className = "kmc-prose") {
    const wrapper = el("div", { class: className });
    for (const block of text.trim().split(/\n\s*\n/)) {
      const paragraph = el("p");
      const lines = block.split("\n");
      lines.forEach((lineText, index) => {
        append(paragraph, lineText);
        if (index < lines.length - 1) {
          paragraph.appendChild(hostDocument.createElement("br"));
        }
      });
      wrapper.appendChild(paragraph);
    }
    return wrapper;
  }
  function button(label, onClick, variant = "secondary", options = {}) {
    return el("button", {
      class: `kmc-btn kmc-btn--${variant}`,
      text: label,
      ...options.title ? { title: options.title } : {},
      attrs: { type: "button", ...options.disabled ? { disabled: true } : {} },
      on: { click: onClick }
    });
  }
  function disclosure(summaryText, build) {
    const details = el("details", { class: "kmc-disclosure" });
    const summary = hostDocument.createElement("summary");
    summary.textContent = summaryText;
    details.appendChild(summary);
    let built = false;
    details.addEventListener("toggle", () => {
      if (details.open && !built) {
        built = true;
        details.appendChild(build());
      }
    });
    return details;
  }
  const runState = { running: false, steps: [] };
  function renderDiagnostics(shell) {
    const body = el("div");
    if (runState.inspecting) {
      renderInspection(shell, body, runState.inspecting);
      return;
    }
    append(body, renderEnvironmentSection());
    if (runState.running) {
      append(
        body,
        el(
          "section",
          { class: "kmc-section" },
          el("h4", { class: "kmc-section__title", text: "正在运行生成诊断" }),
          renderStepList(runState.steps)
        )
      );
    } else if (runState.result) {
      append(body, renderResultSection(runState.result));
    }
    append(body, renderFidelityNote());
    append(body, renderEventLogSection(shell));
    append(body, renderHistorySection(shell));
    shell.setBody(body);
    shell.setFooter(renderFooter(shell));
  }
  function renderEventLogSection(shell) {
    const entries = eventLog.list();
    return el(
      "section",
      { class: "kmc-section" },
      el("h4", { class: "kmc-section__title", text: `运行日志（${entries.length}）` }),
      disclosure(
        "查看运行日志",
        () => el(
          "div",
          {},
          el("pre", { class: "kmc-pre", text: eventLog.format() || "（暂无记录）" }),
          el(
            "div",
            { class: "kmc-actions" },
            button("刷新", () => shell.requestRender(), "ghost"),
            button(
              "复制日志",
              () => {
                adapter.copyText(eventLog.format());
                adapter.notify("success", "运行日志已复制");
              },
              "ghost"
            )
          )
        )
      )
    );
  }
  function renderEnvironmentSection() {
    const environment = generationDiagnostics.collectEnvironment();
    const availability = generationDiagnostics.availability();
    const latest = diagnosticStore.latest();
    const rows2 = el("div", { class: "kmc-rows" });
    const row2 = (label, value, mono = false) => {
      append(
        rows2,
        el(
          "div",
          { class: "kmc-row" },
          el("div", { class: "kmc-row__label", text: label }),
          el("div", {
            class: `kmc-row__value${mono ? " kmc-row__value--mono" : ""}`,
            text: value ?? "Unknown"
          })
        )
      );
    };
    row2("Preset", environment.presetName);
    row2("Provider", environment.provider);
    row2("Model", environment.model, true);
    row2("TavernHelper", environment.tavernHelperVersion ?? "Unknown");
    row2("SillyTavern", environment.sillyTavernVersion ?? "Unknown");
    row2(
      "Generation",
      availability.fidelity === "unavailable" ? "不可用" : latest ? latest.success ? "上次测试通过" : "上次测试失败" : "尚未测试"
    );
    const section2 = el(
      "section",
      { class: "kmc-section" },
      el("h4", { class: "kmc-section__title", text: "环境" }),
      rows2
    );
    if (availability.reason) {
      append(
        section2,
        el("div", {
          class: "kmc-callout kmc-callout--warn",
          style: { marginTop: "10px" },
          text: availability.reason
        })
      );
    }
    const observed = diagnosticStore.latestObserved();
    if (observed) {
      const captured = observed.confidence === "observed";
      const callout = el(
        "div",
        { class: `kmc-callout kmc-callout--${captured ? "error" : "warn"}`, style: { marginTop: "10px" } },
        el("div", {
          class: "kmc-callout__title",
          text: captured ? "⚠ 最近一次聊天生成失败" : "⚠ 最近一次聊天生成疑似失败"
        }),
        el("div", {
          text: observed.error ? summariseGenerationError(observed.error) : observed.message
        }),
        el("div", {
          style: { marginTop: "4px", fontSize: "12px", opacity: "0.8" },
          text: `${new Date(observed.timestamp).toLocaleTimeString()}${observed.model ? ` · ${observed.model}` : ""}`
        })
      );
      if (observed.error) {
        append(callout, renderErrorDetail(observed.error));
      }
      append(section2, callout);
    }
    return section2;
  }
  function renderStepList(steps) {
    const list = el("div", { class: "kmc-steps" });
    for (const step of steps) {
      append(
        list,
        el(
          "div",
          { class: `kmc-steps__item kmc-steps__item--${step.status}` },
          step.status === "running" ? el("span", { class: "kmc-steps__glyph" }, el("span", { class: "kmc-spinner" })) : el("span", {
            class: `kmc-steps__glyph kmc-steps__glyph--${step.status}`,
            text: glyphFor(step.status),
            attrs: { "aria-hidden": "true" }
          }),
          el("span", { class: "kmc-steps__label", text: step.label }),
          step.note && el("span", { class: "kmc-steps__note", text: step.note })
        )
      );
    }
    return list;
  }
  function glyphFor(status) {
    switch (status) {
      case "ok":
        return "✓";
      case "failed":
        return "✕";
      case "unavailable":
        return "○";
      default:
        return "·";
    }
  }
  function renderResultSection(result) {
    const section2 = el("section", { class: "kmc-section" });
    if (result.success) {
      append(
        section2,
        el(
          "div",
          { class: "kmc-callout kmc-callout--ok" },
          el("div", { class: "kmc-callout__title", text: "生成诊断成功 ✓" }),
          el("div", { text: "当前没有检测到明显的生成错误。" })
        )
      );
    } else {
      append(section2, renderErrorCallout(result.error));
    }
    const rows2 = el("div", { class: "kmc-rows", style: { marginTop: "12px" } });
    const row2 = (label, value, mono = false) => {
      if (!value) return;
      append(
        rows2,
        el(
          "div",
          { class: "kmc-row" },
          el("div", { class: "kmc-row__label", text: label }),
          el("div", {
            class: `kmc-row__value${mono ? " kmc-row__value--mono" : ""}`,
            text: value
          })
        )
      );
    };
    row2("Provider", result.environment.provider);
    row2("Model", result.environment.model, true);
    row2("Preset", result.environment.presetName);
    row2("Generation", result.success ? "SUCCESS" : "FAILED");
    row2("耗时", `${(result.durationMs / 1e3).toFixed(1)} s`);
    if (result.success) {
      row2("响应长度", `${result.responseLength ?? 0} characters`);
    }
    if (result.error) {
      row2("HTTP Status", result.error.httpStatus ? String(result.error.httpStatus) : void 0, true);
      row2("Code", result.error.code, true);
      row2("Type", result.error.type, true);
      row2("Source", result.error.source);
      row2("Time", new Date(result.timestamp).toLocaleTimeString());
    }
    append(section2, rows2);
    append(section2, renderStepList(result.steps));
    if (result.structure) {
      append(section2, renderStructureReport(result.structure));
    }
    if (result.success && result.responseText) {
      const text = result.responseText;
      append(
        section2,
        disclosure("查看测试输出", () => el("pre", { class: "kmc-pre", text }))
      );
    }
    if (result.error) {
      append(section2, renderErrorDetail(result.error));
    }
    return section2;
  }
  function renderStructureReport(report) {
    const container = el("section", { class: "kmc-section", style: { marginTop: "14px" } });
    append(container, el("h4", { class: "kmc-section__title", text: "提示词结构" }));
    if (!report.observed) {
      append(
        container,
        el("div", { class: "kmc-callout", text: "无法获取本次发送的提示词结构。" })
      );
      return container;
    }
    if (report.findings.length === 0) {
      append(
        container,
        el("div", {
          class: "kmc-callout kmc-callout--ok",
          text: "未检测到干扰。" + (report.messagesAfter !== void 0 ? `本次发送 ${report.messagesAfter} 条消息。` : "")
        })
      );
      return container;
    }
    for (const finding of report.findings) {
      append(
        container,
        el(
          "div",
          {
            class: `kmc-callout kmc-callout--${finding.severity === "error" ? "error" : "warn"}`,
            style: { marginBottom: "8px" }
          },
          el("div", {
            class: "kmc-callout__title",
            text: `${finding.severity === "error" ? "✕" : "⚠"} ${finding.title}`
          }),
          el("div", { text: finding.detail })
        )
      );
    }
    if (report.injectors.length > 0) {
      const injectors = report.injectors;
      append(
        container,
        disclosure(`查看全部注入来源（${injectors.length}）`, () => {
          const rows2 = el("div", { class: "kmc-rows" });
          for (const entry of injectors) {
            append(
              rows2,
              el(
                "div",
                { class: "kmc-row" },
                el("div", {
                  class: "kmc-row__label kmc-row__value--mono",
                  text: entry.key
                }),
                el("div", {
                  class: "kmc-row__value",
                  text: `${entry.length} 字` + (entry.depth !== void 0 ? ` · depth ${entry.depth}` : "") + (entry.kind === "core" ? " · 酒馆自带" : entry.kind === "context" ? " · 会额外注入内容的扩展" : " · 第三方扩展")
                })
              )
            );
          }
          return rows2;
        })
      );
    }
    return container;
  }
  function renderErrorCallout(error) {
    const callout = el("div", { class: "kmc-callout kmc-callout--error" });
    append(callout, el("div", { class: "kmc-callout__title", text: "生成诊断失败" }));
    append(
      callout,
      el("div", { text: error ? summariseGenerationError(error) : "未知错误" })
    );
    if (error?.bodyUnavailable) {
      append(
        callout,
        el("div", {
          style: { marginTop: "8px", fontSize: "12.5px" },
          text: diagnosticsContent.bodyUnavailableHint
        })
      );
    }
    return callout;
  }
  function renderErrorDetail(error) {
    return disclosure("查看详细错误", () => {
      const container = el("div");
      if (error.providerMessage && error.providerMessage !== error.message) {
        append(
          container,
          el("div", { class: "kmc-section__title", text: "Provider Message" }),
          el("pre", { class: "kmc-pre", text: error.providerMessage })
        );
      }
      append(
        container,
        el("div", { class: "kmc-section__title", style: { marginTop: "10px" }, text: "Raw Error" }),
        el("pre", { class: "kmc-pre", text: safeJson(error.raw) })
      );
      if (error.stack) {
        append(
          container,
          el("div", { class: "kmc-section__title", style: { marginTop: "10px" }, text: "Stack" }),
          el("pre", { class: "kmc-pre", text: error.stack })
        );
      }
      return container;
    });
  }
  function renderFidelityNote() {
    const availability = generationDiagnostics.availability();
    const note = availability.fidelity === "unavailable" ? diagnosticsContent.unavailableNote : availability.fidelity === "reduced" ? diagnosticsContent.reducedFidelityNote : diagnosticsContent.fidelityNote;
    return el(
      "section",
      { class: "kmc-section" },
      disclosure("诊断是怎么进行的？", () => paragraphs(note))
    );
  }
  function renderHistorySection(shell) {
    const history = diagnosticStore.history();
    const section2 = el(
      "section",
      { class: "kmc-section" },
      el("h4", { class: "kmc-section__title", text: `诊断历史（最近 ${history.length} 次）` })
    );
    if (history.length === 0) {
      append(section2, el("div", { class: "kmc-empty", text: "还没有运行过诊断。" }));
      return section2;
    }
    const list = el("div", { class: "kmc-history" });
    for (const entry of history) {
      append(
        list,
        el(
          "button",
          {
            class: "kmc-history__item",
            attrs: { type: "button" },
            on: {
              click: () => {
                runState.inspecting = entry;
                shell.requestRender();
              }
            }
          },
          el("span", { class: "kmc-history__time", text: new Date(entry.timestamp).toLocaleTimeString() }),
          el("span", {
            class: `kmc-dot kmc-dot--${entry.success ? "ok" : "error"}`,
            attrs: { "aria-hidden": "true" }
          }),
          el("span", {
            class: "kmc-history__label",
            text: entry.success ? `${entry.environment.provider ?? "Unknown"} · Success` : `${entry.environment.provider ?? "Unknown"} · ${entry.error?.httpStatus ? `HTTP ${entry.error.httpStatus}` : "失败"}`
          })
        )
      );
    }
    append(section2, list);
    return section2;
  }
  function renderInspection(shell, body, result) {
    append(body, renderResultSection(result));
    shell.setBody(body);
    shell.setFooter([
      button("← 返回诊断中心", () => {
        runState.inspecting = void 0;
        shell.requestRender();
      }),
      el("div", { class: "kmc-footer__spacer" }),
      button("复制诊断信息", () => copyReport(result), "secondary")
    ]);
  }
  function renderFooter(shell) {
    const available = generationDiagnostics.availability().fidelity !== "unavailable";
    if (runState.running) {
      return [
        button("中止诊断", () => generationDiagnostics.cancel(), "danger"),
        el("div", { class: "kmc-footer__spacer" })
      ];
    }
    return [
      button(
        runState.result ? "重新运行生成诊断" : "运行生成诊断",
        () => void startRun(shell),
        "primary",
        { disabled: !available, ...available ? {} : { title: diagnosticsContent.unavailableNote } }
      ),
      el("div", { class: "kmc-footer__spacer" }),
      button("复制诊断信息", () => copyReport(runState.result ?? diagnosticStore.latest())),
      diagnosticStore.history().length > 0 && button(
        "清空历史",
        () => {
          diagnosticStore.clearHistory();
          runState.result = void 0;
          shell.requestRender();
        },
        "ghost"
      )
    ];
  }
  async function startRun(shell) {
    if (runState.running) return void 0;
    runState.running = true;
    runState.result = void 0;
    runState.steps = [];
    shell.requestRender();
    try {
      const result = await generationDiagnostics.run((steps) => {
        runState.steps = steps;
        shell.requestRender();
      });
      runState.result = result;
      return result;
    } catch (error) {
      adapter.notify("error", error instanceof Error ? error.message : String(error), "诊断");
      return void 0;
    } finally {
      runState.running = false;
      shell.requestRender();
    }
  }
  function copyReport(result) {
    const report = buildDiagnosticReport(result);
    const copied = adapter.copyText(report);
    adapter.notify(
      copied ? "success" : "warning",
      copied ? "诊断信息已复制到剪贴板（已脱敏）" : "复制失败，请手动选择文本复制",
      `Kemini ${PANEL_VERSION}`
    );
  }
  function resetDiagnosticsView() {
    runState.running = false;
    runState.steps = [];
    runState.result = void 0;
    runState.inspecting = void 0;
  }
  function safeJson(value) {
    try {
      return JSON.stringify(value, null, 2) ?? String(value);
    } catch {
      return String(value);
    }
  }
  function renderAbout(shell) {
    const body = el("div");
    const environment = adapter.collectEnvironment();
    append(body, paragraphs(dashboardContent.about));
    if (dashboardContent.credits.trim() !== "") {
      append(
        body,
        el(
          "section",
          { class: "kmc-section", style: { marginTop: "18px" } },
          el("h4", { class: "kmc-section__title", text: "致谢" }),
          paragraphs(dashboardContent.credits)
        )
      );
    }
    append(
      body,
      el(
        "section",
        { class: "kmc-section", style: { marginTop: "18px" } },
        el("h4", { class: "kmc-section__title", text: "版本" }),
        el(
          "div",
          { class: "kmc-rows" },
          row("面板版本", PANEL_VERSION),
          row("预设版本", presetIdentity.presetVersion),
          row("SillyTavern", environment.sillyTavernVersion ?? "Unknown"),
          row("TavernHelper", environment.tavernHelperVersion ?? "Unknown")
        )
      )
    );
    append(
      body,
      el(
        "section",
        { class: "kmc-section" },
        disclosure(
          "查看运行日志",
          () => el("pre", { class: "kmc-pre", text: eventLog.format() || "（暂无记录）" })
        )
      )
    );
    shell.setBody(body);
    shell.setFooter([
      button("复制诊断信息", () => copyReport(diagnosticStore.latest())),
      el("div", { class: "kmc-footer__spacer" }),
      button(
        "重置首次引导",
        () => {
          settingsStore.resetOnboarding();
          adapter.notify("info", "下次加载时将重新显示配置向导", "Kemini");
          shell.requestRender();
        },
        "ghost",
        { title: "导出预设前如果不希望把你自己的配置状态带给用户，可以先点这里。" }
      )
    ]);
  }
  function row(label, value) {
    return el(
      "div",
      { class: "kmc-row" },
      el("div", { class: "kmc-row__label", text: label }),
      el("div", { class: "kmc-row__value", text: value })
    );
  }
  const configurationRules = profile.configurationRules;
  class ConfigEngine {
    constructor(rules = configurationRules) {
      this.rules = rules;
    }
    resolve(answers) {
      const matchedRuleIds = [];
      const rejected = [];
      const promptActions = /* @__PURE__ */ new Map();
      const variableActions = /* @__PURE__ */ new Map();
      const regexActions = /* @__PURE__ */ new Map();
      for (const rule of this.rules) {
        if (!this.matches(rule.when, answers)) {
          continue;
        }
        matchedRuleIds.push(rule.id);
        for (const action of rule.actions) {
          if (action.type === "setRegexEnabled") {
            const regex = getRegexDefinition(action.regexId);
            if (!regex) {
              rejected.push({
                promptId: action.regexId,
                reason: "未在 configurableRegexes 中登记，已忽略"
              });
              continue;
            }
            regexActions.set(regex.stableId, {
              type: "setRegexEnabled",
              regexId: regex.stableId,
              enabled: action.enabled
            });
            continue;
          }
          const definition = resolvePromptDefinition(action.promptId);
          if (!definition) {
            rejected.push({
              promptId: action.promptId,
              reason: "未在 promptRegistry 中登记，已忽略"
            });
            continue;
          }
          if (action.type === "setPromptEnabled") {
            promptActions.set(definition.stableId, {
              type: "setPromptEnabled",
              promptId: definition.stableId,
              enabled: action.enabled
            });
            continue;
          }
          if (!definition.variables?.some((entry) => entry.name === action.variable)) {
            rejected.push({
              promptId: `${action.promptId}.${action.variable}`,
              reason: "该变量未在 promptRegistry 中声明为可编辑，已忽略"
            });
            continue;
          }
          const value = resolveValue(action.value, answers);
          if (value === void 0) {
            continue;
          }
          variableActions.set(`${definition.stableId}::${action.variable}`, {
            type: "setPromptVariable",
            promptId: definition.stableId,
            variable: action.variable,
            value
          });
        }
      }
      const ordered = [];
      for (const definition of configurablePrompts) {
        const action = promptActions.get(definition.stableId);
        if (action) {
          ordered.push(action);
        }
        for (const variable of definition.variables ?? []) {
          const variableAction = variableActions.get(`${definition.stableId}::${variable.name}`);
          if (variableAction) {
            ordered.push(variableAction);
          }
        }
      }
      for (const regex of configurableRegexes) {
        const action = regexActions.get(regex.stableId);
        if (action) {
          ordered.push(action);
        }
      }
      return { actions: ordered, matchedRuleIds, rejected };
    }
    matches(condition, answers) {
      if (condition === void 0) {
        return true;
      }
      if (typeof condition === "function") {
        try {
          return condition(answers) === true;
        } catch {
          return false;
        }
      }
      return Object.entries(condition).every(
        ([key, expected]) => valueMatches(answers[key], expected)
      );
    }
  }
  function valueMatches(actual, expected) {
    if (Array.isArray(actual)) {
      if (Array.isArray(expected)) {
        return expected.every((entry) => actual.includes(entry));
      }
      return actual.includes(expected);
    }
    return actual === expected;
  }
  function resolveValue(value, answers) {
    if (typeof value === "string") {
      return value;
    }
    const answer = answers[value.fromAnswer];
    return typeof answer === "string" ? answer : void 0;
  }
  function resolvePromptDefinition(promptId) {
    const byKey2 = getPromptDefinition(promptId);
    if (byKey2) {
      return byKey2;
    }
    return configurablePrompts.find((definition) => definition.stableId === promptId);
  }
  const configEngine = new ConfigEngine();
  function renderQuestion(step, value, onChange) {
    const container = el("div", { class: "kmc-question" });
    append(
      container,
      el("h3", { class: "kmc-step-title", text: step.title }),
      step.description && el("p", { class: "kmc-step-desc", text: step.description })
    );
    const options = (step.options ?? []).filter(
      (option) => !option.requiresPrompt || presetService.hasPrompt(option.requiresPrompt)
    );
    switch (step.inputType) {
      case "single":
      case "select":
        append(container, renderChoices(options, value, onChange, false));
        break;
      case "multi":
        append(container, renderChoices(options, value, onChange, true));
        break;
      case "toggle":
        append(container, renderToggle(value === true, onChange));
        break;
      case "text":
        append(container, renderText(step, value, onChange, false));
        break;
      case "textarea":
        append(container, renderText(step, value, onChange, true));
        break;
    }
    if (step.help) {
      const help = step.help;
      append(
        container,
        el(
          "div",
          { class: "kmc-help" },
          disclosure("为什么要问这个？", () => paragraphs(help))
        )
      );
    }
    return container;
  }
  function renderChoices(options, value, onChange, multi) {
    const selected = new Set(
      multi ? Array.isArray(value) ? value.map(String) : [] : value === void 0 ? [] : [String(value)]
    );
    const list = el("div", { class: "kmc-options", attrs: { role: multi ? "group" : "radiogroup" } });
    for (const option of options) {
      const isSelected = selected.has(option.id);
      const card = el("button", {
        class: `kmc-option${multi ? " kmc-option--multi" : ""}${isSelected ? " kmc-option--selected" : ""}`,
        attrs: {
          type: "button",
          role: multi ? "checkbox" : "radio",
          "aria-checked": isSelected ? "true" : "false"
        },
        on: {
          click: () => {
            if (!multi) {
              onChange(option.id);
              return;
            }
            const next = new Set(selected);
            if (next.has(option.id)) {
              next.delete(option.id);
            } else {
              next.add(option.id);
            }
            onChange([...next]);
          }
        }
      });
      append(
        card,
        el("span", { class: "kmc-option__mark", attrs: { "aria-hidden": "true" } }),
        el(
          "span",
          { class: "kmc-option__body" },
          el(
            "span",
            { class: "kmc-option__label" },
            option.label,
            option.recommended && el("span", { class: "kmc-chip", text: "推荐" }),
            option.notRecommended && el("span", { class: "kmc-chip kmc-chip--muted", text: "不推荐" })
          ),
          option.description && el("span", { class: "kmc-option__desc", text: option.description })
        )
      );
      list.appendChild(card);
    }
    return list;
  }
  function renderToggle(enabled, onChange) {
    return renderChoices(
      [
        { id: "true", label: "开启" },
        { id: "false", label: "关闭" }
      ],
      enabled ? "true" : "false",
      (next) => onChange(next === "true"),
      false
    );
  }
  function renderText(step, value, onChange, multiline) {
    const initial = typeof value === "string" ? value : "";
    const field = multiline ? el("textarea", {
      class: "kmc-textarea",
      attrs: { placeholder: step.placeholder ?? "", rows: 4 }
    }) : el("input", {
      class: "kmc-input",
      attrs: { type: "text", placeholder: step.placeholder ?? "" }
    });
    field.value = initial;
    if (!step.showLength) {
      field.addEventListener("input", () => onChange(field.value));
      return field;
    }
    const target = step.tokenTarget;
    const counter = el("div", { class: "kmc-counter" });
    let sequence = 0;
    let timer;
    let last = { state: "pending" };
    const paint = (count) => {
      last = count.state === "pending" && last.state === "ready" ? { ...last, state: "pending" } : count;
      const chars = `${field.value.length} 字`;
      if (last.tokens === void 0) {
        counter.textContent = last.state === "pending" ? `${chars} · 正在统计 token…` : target ? `${chars} · token 数无法获取（目标 ${target} token，注意不是字数）` : `${chars} · token 数无法获取`;
        counter.classList.remove("kmc-counter--met");
        return;
      }
      const shown = `${last.tokens.toLocaleString("en-US")} token${last.state === "pending" ? "…" : ""}`;
      counter.textContent = target ? `${shown} / ${target} · ${chars}` : `${shown} · ${chars}`;
      counter.classList.toggle("kmc-counter--met", last.tokens >= (target ?? 0));
    };
    const refresh = () => {
      paint({ state: "pending", tokens: last.tokens });
      if (timer !== void 0) clearTimeout(timer);
      timer = setTimeout(() => {
        const mine = ++sequence;
        const text = field.value;
        void adapter.countTokens(text).then((tokens) => {
          if (mine !== sequence) return;
          paint(tokens === void 0 ? { state: "unavailable" } : { state: "ready", tokens });
        });
      }, 350);
    };
    refresh();
    field.addEventListener("input", () => {
      refresh();
      onChange(field.value);
    });
    return el("div", {}, field, counter);
  }
  function renderReview(answers, changeSet, options = {}) {
    const container = el("div");
    const answerRows = el("div", { class: "kmc-rows" });
    for (const question of questionSteps()) {
      if (!(question.id in answers)) continue;
      append(
        answerRows,
        el(
          "div",
          { class: "kmc-row" },
          el("div", { class: "kmc-row__label", text: question.title }),
          el("div", { class: "kmc-row__value", text: describeAnswer(question.id, answers[question.id]) })
        )
      );
    }
    append(
      container,
      el(
        "section",
        { class: "kmc-section" },
        el("h4", { class: "kmc-section__title", text: "你的选择" }),
        answerRows
      )
    );
    const { changes, unchanged, missing } = changeSet;
    const changeSection = el("section", { class: "kmc-section" });
    append(changeSection, el("h4", { class: "kmc-section__title", text: "即将修改" }));
    const regexChanges = changeSet.regexChanges;
    if (changes.length === 0 && changeSet.variableChanges.length === 0 && regexChanges.length === 0) {
      append(
        changeSection,
        el("div", {
          class: "kmc-callout",
          text: "当前预设已经符合你的选择，无需修改。"
        })
      );
    } else if (changes.length > 0) {
      append(changeSection, renderDiffList(changes));
    }
    if (regexChanges.length > 0) {
      append(
        changeSection,
        el(
          "div",
          { style: { marginTop: changes.length > 0 ? "8px" : "0" } },
          renderDiffList(
            regexChanges.map((change) => ({
              stableId: change.stableId,
              displayName: change.displayName,
              from: change.from,
              to: change.to
            }))
          )
        )
      );
    }
    if (changeSet.variableChanges.length > 0) {
      append(
        changeSection,
        el(
          "div",
          { style: { marginTop: changes.length > 0 ? "10px" : "0" } },
          ...changeSet.variableChanges.map(renderTextChange)
        )
      );
    }
    if (options.showUnchanged && unchanged.length > 0) {
      append(
        changeSection,
        el(
          "div",
          { class: "kmc-section", style: { marginTop: "14px", marginBottom: "0" } },
          el("h4", { class: "kmc-section__title", text: "已经是目标状态" }),
          renderDiffList(unchanged)
        )
      );
    }
    append(container, changeSection);
    if (changeSet.invalid.length > 0) {
      append(container, renderInvalid(changeSet.invalid));
    }
    if (missing.length > 0) {
      append(container, renderMissing(missing));
    }
    return container;
  }
  function renderTextChange(change) {
    const show = (text) => text.trim() === "" ? el("span", { class: "kmc-diff__desc", text: "（空）" }) : el("pre", { class: "kmc-pre", text });
    return el(
      "div",
      { class: "kmc-diff__item", style: { flexDirection: "column", gap: "6px" } },
      el(
        "div",
        { style: { display: "flex", gap: "10px", alignItems: "baseline" } },
        el("span", { class: "kmc-diff__glyph kmc-diff__glyph--on", text: "✎", attrs: { "aria-hidden": "true" } }),
        el("span", { class: "kmc-diff__name", text: change.displayName })
      ),
      el("div", { class: "kmc-section__title", text: "当前" }),
      show(change.from),
      el("div", { class: "kmc-section__title", text: "改为" }),
      show(change.to)
    );
  }
  function renderPersistenceNote(result) {
    switch (result.status) {
      case "saved":
        return el("div", {
          class: "kmc-callout kmc-callout--ok kmc-banner",
          text: `已保存到预设「${result.presetName}」，切换预设后依然有效。`
        });
      case "disabled":
        return el("div", {
          class: "kmc-callout kmc-banner",
          text: "自动保存已关闭：本次修改只在当前会话生效，切换预设后会还原。"
        });
      case "failed":
        return el(
          "div",
          { class: "kmc-callout kmc-callout--warn kmc-banner" },
          el("div", { class: "kmc-callout__title", text: "配置已生效，但没能保存到预设文件" }),
          el("div", { text: result.reason }),
          el("div", {
            style: { marginTop: "6px" },
            text: "切换预设后会还原。可以在酒馆里手动保存一次预设。"
          })
        );
      default:
        return el("div", {
          class: "kmc-callout kmc-banner",
          text: `配置已生效，但未写入预设文件：${result.reason}`
        });
    }
  }
  function renderInvalid(invalid) {
    const callout = el("div", { class: "kmc-callout kmc-callout--error" });
    append(
      callout,
      el("div", { class: "kmc-callout__title", text: "以下输入无法应用" }),
      ...invalid.map(
        (entry) => el("div", { text: `${entry.displayName}：${entry.message}` })
      ),
      el("div", {
        style: { marginTop: "6px" },
        text: "这几项会保持原样，其余配置仍会正常应用。"
      })
    );
    return callout;
  }
  function renderDiffList(changes) {
    const list = el("div", { class: "kmc-diff" });
    for (const change of changes) {
      append(
        list,
        el(
          "div",
          { class: "kmc-diff__item" },
          el("span", {
            class: `kmc-diff__glyph kmc-diff__glyph--${change.to ? "on" : "off"}`,
            text: change.to ? "✓" : "✕",
            attrs: { "aria-hidden": "true" }
          }),
          el(
            "div",
            { class: "kmc-diff__body" },
            el("div", { class: "kmc-diff__name", text: change.displayName }),
            change.description && el("div", { class: "kmc-diff__desc", text: change.description })
          )
        )
      );
    }
    return list;
  }
  function renderMissing(missing) {
    const notFound = missing.filter((entry) => entry.reason === "not-found");
    const unlisted = missing.filter((entry) => entry.reason === "unlisted");
    const callout = el("div", { class: "kmc-callout kmc-callout--warn" });
    append(
      callout,
      el("div", {
        class: "kmc-callout__title",
        text: `有 ${missing.length} 项配置无法应用`
      })
    );
    if (notFound.length > 0) {
      append(
        callout,
        el("div", {
          text: `在当前预设中找不到：${notFound.map((entry) => entry.displayName).join("、")}`,
          title: notFound.map((entry) => entry.stableId).join(", ")
        })
      );
    }
    if (unlisted.length > 0) {
      append(
        callout,
        el("div", {
          text: `以下条目存在于预设中，但没有被加入提示词列表，开关不会生效：` + unlisted.map((entry) => entry.displayName).join("、"),
          title: unlisted.map((entry) => entry.stableId).join(", ")
        })
      );
    }
    append(
      callout,
      el("div", {
        style: { marginTop: "6px" },
        text: "其余配置仍会正常应用。"
      })
    );
    return callout;
  }
  class OnboardingFlow {
    constructor(shell) {
      this.shell = shell;
      this.answers = settingsStore.getAnswers();
      this.seedFromPreset();
      eventLog.info("onboarding started");
    }
    phase = { kind: "steps", index: 0 };
    answers;
    /** Footer controls whose state depends on the current answer. See `refreshGate`. */
    gate;
    /**
     * Fill the free-text boxes with what the preset currently contains.
     *
     * Only for questions with no stored answer yet — a saved answer always wins, otherwise
     * re-running the wizard would silently discard the user's own text. Seeding also makes
     * "accept the defaults" a true no-op for these fields.
     */
    seedFromPreset() {
      for (const seed of seededQuestions()) {
        if (typeof this.answers[seed.id] === "string") {
          continue;
        }
        const definition = getPromptDefinition(seed.promptKey);
        if (!definition) continue;
        const current = presetService.readPromptVariable(definition.stableId, seed.variable);
        if (current !== void 0) {
          this.answers[seed.id] = current;
        }
      }
    }
    render() {
      switch (this.phase.kind) {
        case "steps":
          this.renderStep(this.phase.index);
          break;
        case "review":
          this.renderReviewPhase();
          break;
        case "applying":
          this.renderApplying();
          break;
        case "applied":
          this.renderApplied(this.phase.outcome);
          break;
        case "diagnostic-running":
          this.renderDiagnosticRunning(this.phase.steps);
          break;
        case "diagnostic-done":
          this.renderDiagnosticDone(this.phase.result);
          break;
      }
    }
    // ---------------------------------------------------------------------------------
    // Walkthrough
    // ---------------------------------------------------------------------------------
    /**
     * Steps that are currently reachable. Recomputed on every render because a `showWhen`
     * step can appear or disappear as soon as the answer it depends on changes.
     */
    get visible() {
      return visibleSteps(this.answers);
    }
    get totalPanels() {
      return this.visible.length + 1;
    }
    renderStep(index) {
      const steps = this.visible;
      const step = steps[index];
      if (!step) {
        this.phase = { kind: "review" };
        this.render();
        return;
      }
      this.shell.setTitle(onboardingContent.title, onboardingContent.subtitle);
      this.shell.setProgress(index, this.totalPanels);
      this.shell.setBody(this.buildStepBody(step));
      const isFirst = index === 0;
      const hint = el("span", { class: "kmc-footer__hint" });
      const next = button(isFirst ? "开始" : "下一步", () => this.goTo(index + 1), "primary");
      this.gate = { step, next, hint };
      this.refreshGate();
      this.shell.setFooter([
        !isFirst && button("上一步", () => this.goTo(index - 1)),
        el("div", { class: "kmc-footer__spacer" }),
        hint,
        next
      ]);
    }
    /**
     * Bring 下一步 into line with the current answer.
     *
     * Called on every keystroke of a blocking question. Cheap and idempotent by design — it
     * only ever sets two properties, so calling it more often than strictly needed is fine.
     */
    refreshGate() {
      if (!this.gate) {
        return;
      }
      const blockedBy = this.blockingMessage(this.gate.step);
      this.gate.hint.textContent = blockedBy ?? "";
      if (blockedBy === void 0) {
        this.gate.next.removeAttribute("disabled");
      } else {
        this.gate.next.setAttribute("disabled", "true");
      }
    }
    /** Why 下一步 is unavailable on this step, or `undefined` when it is available. */
    blockingMessage(step) {
      if (!isQuestionStep(step) || step.requireAnswer === void 0) {
        return void 0;
      }
      const answer = this.answers[step.id];
      return typeof answer === "string" && answer.trim() !== "" ? void 0 : step.requireAnswer;
    }
    buildStepBody(step) {
      if (!isQuestionStep(step)) {
        return el(
          "div",
          {},
          el("h3", { class: "kmc-step-title", text: step.title }),
          paragraphs(step.content),
          step.notice && paragraphs(
            step.notice,
            step.noticeTone === "danger" ? "kmc-notice kmc-notice--danger" : "kmc-notice"
          )
        );
      }
      return renderQuestion(step, this.answers[step.id], (next) => {
        this.answers[step.id] = next;
        if (step.inputType !== "text" && step.inputType !== "textarea") {
          this.render();
        } else {
          this.refreshGate();
        }
      });
    }
    goTo(index) {
      if (index < 0) return;
      if (index >= this.visible.length) {
        this.phase = { kind: "review" };
      } else {
        this.phase = { kind: "steps", index };
      }
      this.render();
    }
    // ---------------------------------------------------------------------------------
    // Review & apply
    // ---------------------------------------------------------------------------------
    renderReviewPhase() {
      const resolved = configEngine.resolve(this.answers);
      const changeSet = presetService.calculateChanges(resolved.actions);
      const stepCount = this.visible.length;
      this.shell.setTitle(onboardingContent.title, "确认配置");
      this.shell.setProgress(stepCount, this.totalPanels);
      const body = el("div");
      append(body, el("div", { class: "kmc-banner" }, paragraphs(onboardingContent.reviewIntro)));
      append(body, renderReview(this.answers, changeSet));
      this.shell.setBody(body);
      this.shell.setFooter([
        button("返回修改", () => this.goTo(stepCount - 1)),
        el("div", { class: "kmc-footer__spacer" }),
        button("应用配置", () => void this.apply(), "primary")
      ]);
    }
    renderApplying() {
      this.shell.setBody(
        el(
          "div",
          { class: "kmc-empty" },
          el("span", { class: "kmc-spinner" }),
          " 正在应用配置…"
        )
      );
      this.shell.setFooter([]);
    }
    async apply() {
      this.phase = { kind: "applying" };
      this.render();
      const resolved = configEngine.resolve(this.answers);
      if (resolved.rejected.length > 0) {
        eventLog.warn(
          `config engine rejected ${resolved.rejected.length} unregistered prompt target(s)`,
          resolved.rejected
        );
      }
      eventLog.info(`answers resolved via rules: ${resolved.matchedRuleIds.join(", ")}`);
      const outcome = await presetService.applyActions(resolved.actions);
      settingsStore.saveAnswers(this.answers);
      settingsStore.markOnboardingCompleted();
      const transport = this.answers["transport"];
      if (transport === "on" || transport === "off") {
        const enabled = transport === "on";
        settingsStore.setAntiTruncationEnabled(enabled);
        antiTruncationInterceptor.setEnabled(enabled);
      }
      if (outcome.missing.length > 0) {
        diagnosticStore.recordConfigurationIssue({
          timestamp: Date.now(),
          message: `找不到 ${outcome.missing.length} 个目标 Prompt`,
          missing: outcome.missing.map((entry) => entry.displayName)
        });
      }
      this.phase = { kind: "applied", outcome };
      this.render();
    }
    renderApplied(outcome) {
      this.shell.setTitle(onboardingContent.title, "配置完成");
      this.shell.setProgress(0, 0);
      const body = el("div");
      if (outcome.error) {
        append(
          body,
          el(
            "div",
            { class: "kmc-callout kmc-callout--error kmc-banner" },
            el("div", { class: "kmc-callout__title", text: "配置未能应用" }),
            el("div", { text: outcome.error.message })
          )
        );
      } else if (outcome.missing.length > 0 || outcome.invalid.length > 0) {
        const succeeded = outcome.applied.length + outcome.appliedVariables.length + outcome.appliedRegexes.length;
        const problems = el("div", { class: "kmc-callout kmc-callout--warn kmc-banner" });
        append(
          problems,
          el("div", { class: "kmc-callout__title", text: "配置部分应用成功" }),
          el("div", { text: `其他 ${succeeded} 项配置已成功应用。` })
        );
        if (outcome.missing.length > 0) {
          append(
            problems,
            el("div", {
              style: { marginTop: "6px" },
              text: `找不到 ${outcome.missing.length} 个目标：` + outcome.missing.map((entry) => entry.displayName).join("、")
            })
          );
        }
        if (outcome.invalid.length > 0) {
          append(
            problems,
            el("div", {
              style: { marginTop: "6px" },
              text: "以下输入被拒绝：" + outcome.invalid.map((entry) => `${entry.displayName}（${entry.message}）`).join("；")
            })
          );
        }
        append(body, problems);
      } else {
        append(
          body,
          el(
            "div",
            { class: "kmc-callout kmc-callout--ok kmc-banner" },
            el("div", { class: "kmc-callout__title", text: "配置完成 ✓" })
          )
        );
      }
      append(body, renderPersistenceNote(outcome.persistence));
      append(body, paragraphs(onboardingContent.completion));
      append(
        body,
        el("div", { style: { marginTop: "16px" } }, paragraphs(onboardingContent.diagnosticsInvitation))
      );
      this.shell.setBody(body);
      const canDiagnose = generationDiagnostics.availability().fidelity !== "unavailable";
      this.shell.setFooter([
        canDiagnose && button("运行生成诊断", () => void this.runDiagnostic(), "primary"),
        el("div", { class: "kmc-footer__spacer" }),
        button("直接开始使用", () => this.shell.close())
      ]);
    }
    // ---------------------------------------------------------------------------------
    // Post-apply compatibility check
    // ---------------------------------------------------------------------------------
    async runDiagnostic() {
      this.phase = { kind: "diagnostic-running", steps: [] };
      this.render();
      const result = await generationDiagnostics.run((steps) => {
        if (this.phase.kind === "diagnostic-running") {
          this.phase = { kind: "diagnostic-running", steps };
          this.render();
        }
      });
      this.phase = { kind: "diagnostic-done", result };
      this.render();
    }
    renderDiagnosticRunning(steps) {
      this.shell.setTitle(onboardingContent.title, "兼容性测试");
      this.shell.setBody(
        el(
          "div",
          {},
          el("h3", { class: "kmc-step-title", text: "正在运行生成诊断" }),
          el("p", {
            class: "kmc-step-desc",
            text: "正在用当前预设和当前模型发起一次真实的生成请求。这不会写入聊天记录。"
          }),
          renderStepList(steps)
        )
      );
      this.shell.setFooter([
        button("中止", () => generationDiagnostics.cancel(), "danger"),
        el("div", { class: "kmc-footer__spacer" })
      ]);
    }
    renderDiagnosticDone(result) {
      this.shell.setTitle(onboardingContent.title, result.success ? "兼容性测试通过" : "兼容性测试失败");
      const body = el("div");
      if (result.success) {
        append(
          body,
          el(
            "div",
            { class: "kmc-callout kmc-callout--ok kmc-banner" },
            el("div", { class: "kmc-callout__title", text: "兼容性测试通过 ✓" }),
            el("div", { text: "当前配置可以正常生成。" })
          )
        );
      }
      append(body, renderResultSection(result));
      this.shell.setBody(body);
      if (result.success) {
        this.shell.setFooter([
          el("div", { class: "kmc-footer__spacer" }),
          button("开始使用", () => this.shell.close(), "primary")
        ]);
        return;
      }
      this.shell.setFooter([
        button("返回修改配置", () => this.goTo(0), "primary"),
        button(
          "查看完整诊断",
          () => this.shell.navigate({ name: "dashboard", tab: "diagnostics" })
        ),
        el("div", { class: "kmc-footer__spacer" }),
        button("复制诊断信息", () => copyReport(result)),
        button("仍然开始使用", () => this.shell.close(), "ghost")
      ]);
    }
  }
  function startOnboarding(shell) {
    shell.navigate({ name: "onboarding" });
  }
  function renderOverview(shell) {
    const body = el("div");
    const environment = adapter.collectEnvironment();
    const answers = settingsStore.getAnswers();
    const status = diagnosticStore.status();
    const validation = presetService.validateCurrentPreset();
    if (validation.status === "unmatched") {
      append(
        body,
        el(
          "div",
          { class: "kmc-callout kmc-callout--warn kmc-banner" },
          el("div", { class: "kmc-callout__title", text: "当前预设可能不是本面板对应的预设" }),
          el("div", {
            text: `当前使用的是「${validation.presetName ?? "未知预设"}」。你仍然可以运行生成诊断，但重新配置只会影响本预设中已登记的 Prompt。`
          })
        )
      );
    } else if (validation.status === "unavailable") {
      append(
        body,
        el(
          "div",
          { class: "kmc-callout kmc-callout--warn kmc-banner" },
          el("div", { class: "kmc-callout__title", text: "无法读取预设" }),
          el("div", { text: validation.reason })
        )
      );
    }
    append(
      body,
      section("环境", rows([
        ["Preset", environment.loadedPresetName ?? "Unknown"],
        ["Preset Version", presetIdentity.presetVersion],
        ["Provider", environment.provider ?? "Unknown"],
        ["Model", environment.model ?? "Unknown"]
      ]))
    );
    const configRows = questionSteps().filter((question) => question.id in answers).map((question) => [question.title, describeAnswer(question.id, answers[question.id])]);
    append(
      body,
      section(
        "当前配置",
        configRows.length > 0 ? rows(configRows) : el("div", { class: "kmc-empty", text: "尚未完成配置。" })
      )
    );
    const statusLine = el(
      "div",
      { class: "kmc-row" },
      el("div", { class: "kmc-row__label", text: "系统状态" }),
      el(
        "div",
        { class: "kmc-row__value" },
        el("span", { class: `kmc-dot kmc-dot--${status.level}`, attrs: { "aria-hidden": "true" } }),
        status.label
      )
    );
    const autoSave = settingsStore.autoSaveToPresetFile;
    const autoSaveLine = el(
      "div",
      { class: "kmc-row" },
      el("div", { class: "kmc-row__label", text: "自动保存" }),
      el(
        "div",
        { class: "kmc-row__value" },
        el("div", { text: autoSave ? "写入预设文件，切换预设后依然有效" : "只在当前会话生效" }),
        button(
          autoSave ? "关闭自动保存" : "开启自动保存",
          () => {
            settingsStore.setAutoSaveToPresetFile(!autoSave);
            shell.requestRender();
          },
          "ghost"
        )
      )
    );
    const antiTruncation = settingsStore.antiTruncationEnabled;
    const antiTruncationLine = el(
      "div",
      { class: "kmc-row" },
      el("div", { class: "kmc-row__label", text: "防截断传输" }),
      el(
        "div",
        { class: "kmc-row__value" },
        el("div", {
          text: antiTruncation ? "回复经由合成函数参数传输，流式与非流式都走" : "关闭，使用渠道原本的输出方式"
        }),
        button(
          antiTruncation ? "关闭防截断" : "开启防截断",
          () => {
            settingsStore.setAntiTruncationEnabled(!antiTruncation);
            antiTruncationInterceptor.setEnabled(!antiTruncation);
            shell.requestRender();
          },
          "ghost"
        )
      )
    );
    const statusRows = [statusLine, autoSaveLine, antiTruncationLine];
    if (antiTruncation) {
      statusRows.push(
        el(
          "div",
          { class: "kmc-row" },
          el("div", { class: "kmc-row__label", text: "上次生成" }),
          el("div", { class: "kmc-row__value" }, el("div", { text: describeLastRun() }))
        )
      );
    }
    append(body, section("状态", el("div", { class: "kmc-rows" }, ...statusRows)));
    if (!settingsStore.isPersistent) {
      append(
        body,
        el("div", {
          class: "kmc-callout kmc-callout--warn",
          text: "当前无法保存设置，你的选择只在本次会话中有效。"
        })
      );
    }
    shell.setBody(body);
    shell.setFooter([
      button("重新运行配置向导", () => startOnboarding(shell), "primary"),
      el("div", { class: "kmc-footer__spacer" }),
      button("运行生成诊断", () => shell.navigate({ name: "dashboard", tab: "diagnostics" }))
    ]);
  }
  function renderReconfigure(shell) {
    const answers = settingsStore.getAnswers();
    const resolved = configEngine.resolve(answers);
    const changeSet = presetService.calculateChanges(resolved.actions);
    const body = el("div");
    append(
      body,
      el("p", {
        class: "kmc-step-desc",
        text: "这里显示当前保存的选择，以及它们与预设当前状态的差异。要修改选择，请重新运行配置向导。"
      }),
      renderReview(answers, changeSet, { showUnchanged: true })
    );
    shell.setBody(body);
    const hasPending = changeSet.changes.length > 0 || changeSet.regexChanges.length > 0 || changeSet.variableChanges.length > 0;
    shell.setFooter([
      button("重新运行配置向导", () => startOnboarding(shell), "primary"),
      el("div", { class: "kmc-footer__spacer" }),
      button(
        hasPending ? "重新应用当前配置" : "预设已同步",
        () => void reapply(shell),
        "secondary",
        { disabled: !hasPending }
      )
    ]);
  }
  async function reapply(shell) {
    const answers = settingsStore.getAnswers();
    const resolved = configEngine.resolve(answers);
    const outcome = await presetService.applyActions(resolved.actions);
    const succeeded = outcome.applied.length + outcome.appliedVariables.length + outcome.appliedRegexes.length;
    if (outcome.error) {
      adapter.notify("error", outcome.error.message, "配置未能应用");
    } else if (outcome.missing.length > 0 || outcome.invalid.length > 0) {
      diagnosticStore.recordConfigurationIssue({
        timestamp: Date.now(),
        message: `${outcome.missing.length} 个目标缺失，${outcome.invalid.length} 项输入被拒绝`,
        missing: [
          ...outcome.missing.map((entry) => entry.displayName),
          ...outcome.invalid.map((entry) => entry.displayName)
        ]
      });
      adapter.notify(
        "warning",
        `${succeeded} 项已应用，${outcome.missing.length + outcome.invalid.length} 项未能应用`,
        "配置部分应用"
      );
    } else {
      const saved = outcome.persistence.status === "saved";
      adapter.notify(
        "success",
        `已应用 ${succeeded} 项修改${saved ? "并保存到预设文件" : ""}`,
        "配置已更新"
      );
    }
    if (outcome.persistence.status === "failed") {
      adapter.notify("warning", outcome.persistence.reason, "未能保存到预设文件");
    }
    shell.requestRender();
  }
  function describeLastRun() {
    const run = antiTruncationInterceptor.lastRun;
    if (!run) return "还没有生成过（开启后发一条消息再回来看）";
    const time = new Date(run.at).toLocaleTimeString();
    switch (run.outcome) {
      case "transported": {
        const cut = (run.endedCleanly ? "" : "；⚠ 上游提前断流，本条可能不完整") + // Set when the transport had to do something unusual to read the channel at all —
        // reframing a JSON-array stream, for instance. Worth saying rather than hiding.
        (run.detail ? `；${run.detail}` : "");
        if (run.plainWon) {
          return `${time} 这条渠道自己也做了抗截断：传输函数里的正文更短，已改用更长的普通正文（${run.emittedChars} 字）${cut}`;
        }
        const how = run.streamed ? `真流式，分 ${run.decodedChunks} 段陆续到达` : "一次性到达（防截断生效，但这条渠道没有逐段下发参数）";
        const clash = run.conflict ? "；已丢弃与正文冲突的较短输出" : "";
        return `${time} 走了防截断，${run.decodedChars} 字，${how}${cut}${clash}`;
      }
      case "no-synthetic-call":
        return `${time} 已注入但模型没有调用传输函数，本条按普通文本输出` + (run.detail ? `；${run.detail}` : "");
      case "bypassed":
        return `${time} 主动跳过（${run.detail ?? "未知原因"}），未改动请求`;
      case "non-stream":
        return `${time} 上游不是流式响应，也没走传输函数（${run.detail ?? "未知原因"}）`;
      case "upstream-error":
        return `${time} 上游报错（${run.detail ?? "未知"}），已原样放行`;
    }
  }
  function section(title, content) {
    return el(
      "section",
      { class: "kmc-section" },
      el("h4", { class: "kmc-section__title", text: title }),
      content
    );
  }
  function rows(entries) {
    const container = el("div", { class: "kmc-rows" });
    for (const [label, value] of entries) {
      append(
        container,
        el(
          "div",
          { class: "kmc-row" },
          el("div", { class: "kmc-row__label", text: label }),
          el("div", { class: "kmc-row__value", text: value })
        )
      );
    }
    return container;
  }
  function renderFallback(shell, error) {
    const message = describe(error);
    shell.setTitle(presetIdentity.displayName, "初始化失败");
    const body = el("div");
    append(
      body,
      el(
        "div",
        { class: "kmc-callout kmc-callout--error kmc-banner" },
        el("div", { class: "kmc-callout__title", text: "Kemini 控制面板初始化失败" }),
        el("div", { text: "面板本身出错了，这通常与你的模型或 API 无关。" })
      ),
      el("div", { class: "kmc-section__title", text: "错误" }),
      el("pre", { class: "kmc-pre", text: message }),
      disclosure(
        "查看运行日志",
        () => el("pre", { class: "kmc-pre", text: eventLog.format() || "（暂无记录）" })
      )
    );
    shell.setBody(body);
    shell.setFooter([
      button("重试", () => shell.navigate({ name: "dashboard", tab: "overview" }), "primary"),
      el("div", { class: "kmc-footer__spacer" }),
      button("复制诊断信息", () => {
        const report = `Kemini Panel Failure

Panel Version:
${PANEL_VERSION}

Error:
${message}

Event Log:
${eventLog.format(40)}
`;
        const copied = adapter.copyText(report);
        adapter.notify(
          copied ? "success" : "warning",
          copied ? "已复制（已脱敏）" : "复制失败，请手动选择文本复制"
        );
      }),
      button("关闭", () => shell.close(), "ghost")
    ]);
  }
  function describe(error) {
    if (error instanceof Error) {
      const sanitised = sanitizeDiagnosticData(error);
      return sanitised.stack ?? sanitised.message ?? error.name;
    }
    try {
      return JSON.stringify(sanitizeDiagnosticData(error), null, 2) ?? String(error);
    } catch {
      return String(error);
    }
  }
  const SVG_NS = "http://www.w3.org/2000/svg";
  function renderCrest(size = 30) {
    const doc = getHostDocument();
    const svg = doc.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 40 40");
    svg.setAttribute("width", String(size));
    svg.setAttribute("height", String(size));
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("class", "kmc-crest");
    const add = (tag, attrs) => {
      const node = doc.createElementNS(SVG_NS, tag);
      for (const [key, value] of Object.entries(attrs)) {
        node.setAttribute(key, value);
      }
      svg.appendChild(node);
      return node;
    };
    add("circle", {
      cx: "20",
      cy: "20",
      r: "18.5",
      class: "kmc-crest__ring"
    });
    add("path", {
      d: "M20 33.5 L20 13 M20 33.5 L15.5 36.5 M20 33.5 L24.5 36.5",
      class: "kmc-crest__trunk"
    });
    add("path", {
      d: "M20 24 C 12.5 24 7.5 19.5 8.5 13.5 C 9.4 8 15 4.5 20 6.5 Z",
      class: "kmc-crest__canopy"
    });
    add("path", {
      d: "M20 22 C 16 21 13.5 18 12.5 14 M20 16 C 17.5 15 16 13 15.5 10",
      class: "kmc-crest__bough"
    });
    add("path", {
      d: "M20 22 L27 16 M27 16 L31.5 13.5 M27 16 L27.5 10.5 M20 15.5 L25.5 9.5 M25.5 9.5 L29 7.5 M25.5 9.5 L24.5 5 M20 27 L24 24",
      class: "kmc-crest__deadwood"
    });
    return svg;
  }
  const STYLE_ELEMENT_ID = "kemini-companion-styles";
  const styles = `
/*
 * ── 卡塞尔 ────────────────────────────────────────────────────────────────────────────
 * Palette taken from the Cassell uniform as described in 龙族: a white shirt, an ink-green
 * suit piped with silver, and a deep rose cravat.
 *
 * That maps cleanly onto a UI without inventing anything:
 *   ink green  → surfaces
 *   silver     → hairline edging and dividers (the piping is the signature detail)
 *   deep rose  → the single accent, i.e. selection and primary action
 *   off-white  → text
 *
 * A fixed palette rather than SillyTavern's theme variables, by the author's choice: the
 * panel should read as part of the preset, not as part of the tavern.
 *
 * Semantic colours are pushed AWAY from the rose accent on purpose. Rose is reddish and
 * error is conventionally red, so error is shifted clearly orange and made brighter — a
 * real failure must never read as decoration.
 */
.kmc-root {
  --kmc-bg: #0e1512;
  --kmc-bg-raised: #16211c;
  --kmc-bg-inset: #0a100d;
  --kmc-border: #26332c;
  --kmc-border-strong: #3a4d43;
  /* The silver piping. Strong enough to actually read as metal, not as a rounding error. */
  --kmc-silver: rgba(208, 219, 212, 0.26);
  --kmc-silver-strong: rgba(216, 226, 220, 0.62);
  --kmc-silver-text: #c3d0c7;
  /*
   * Display face for titles and crest-adjacent chrome. System serifs only — the panel is a
   * single offline file and must not depend on a webfont CDN. Georgia covers Latin on both
   * Windows and macOS; the CJK fallbacks pick up Songti / SimSun.
   */
  --kmc-display: Georgia, "Times New Roman", "Songti SC", "STSong", "Noto Serif CJK SC", "SimSun", serif;
  --kmc-text: #eef2ef;
  --kmc-text-dim: #9fb0a6;
  --kmc-text-faint: #7b8c82;
  --kmc-accent: #c04a63;
  --kmc-accent-hi: #dd6b83;
  --kmc-accent-dim: #3d1d26;
  --kmc-ok: #6fbf8a;
  --kmc-danger: #ff6b7a;
  --kmc-warn: #d2a341;
  --kmc-error: #ef6a4d;
  --kmc-radius: 10px;
  --kmc-ease: 120ms cubic-bezier(0.2, 0, 0.2, 1);

  position: fixed;
  inset: 0;
  z-index: 10050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
  background: rgba(6, 11, 9, 0.68);
  backdrop-filter: blur(3px);
  color: var(--kmc-text);
  font-family: system-ui, -apple-system, "Segoe UI", "Noto Sans SC", sans-serif;
  font-size: 14px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  /* Stop mobile Safari/Chrome inflating text inside the panel on rotation. */
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}
.kmc-root *, .kmc-root *::before, .kmc-root *::after { box-sizing: border-box; }

.kmc-modal {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 620px;
  max-height: 100%;
  border: 1px solid var(--kmc-border-strong);
  border-radius: var(--kmc-radius);
  /*
   * Not a flat fill: a soft top-lit gradient plus a vignette, so the panel reads as a
   * surface with depth rather than a coloured rectangle.
   */
  background:
    radial-gradient(120% 80% at 50% 0%, rgba(126, 158, 140, 0.10) 0%, transparent 60%),
    radial-gradient(100% 100% at 50% 100%, rgba(0, 0, 0, 0.35) 0%, transparent 70%),
    var(--kmc-bg);
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.66),
    inset 0 1px 0 var(--kmc-silver-strong),
    inset 0 0 0 1px var(--kmc-silver);
  overflow: hidden;
}
/*
 * Corner brackets — the dossier/crest frame. Drawn on the two diagonal corners only;
 * bracketing all four reads as a viewfinder rather than a seal.
 */
.kmc-modal::before,
.kmc-modal::after {
  content: "";
  position: absolute;
  width: 11px;
  height: 11px;
  pointer-events: none;
  z-index: 2;
  border-color: var(--kmc-silver-strong);
  border-style: solid;
}
.kmc-modal::before {
  top: 5px; left: 5px;
  border-width: 1px 0 0 1px;
  border-top-left-radius: 4px;
}
.kmc-modal::after {
  bottom: 5px; right: 5px;
  border-width: 0 1px 1px 0;
  border-bottom-right-radius: 4px;
}

/* ── Header ─────────────────────────────────────────────────────────────────────── */
.kmc-header {
  position: relative;
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 15px 18px 14px 20px;
  background: linear-gradient(180deg, rgba(208, 219, 212, 0.05), transparent);
  flex: 0 0 auto;
}
/* Engraved double rule under the header, like a certificate. */
.kmc-header::after {
  content: "";
  position: absolute;
  left: 18px; right: 18px; bottom: 0;
  height: 3px;
  border-top: 1px solid var(--kmc-silver-strong);
  border-bottom: 1px solid var(--kmc-border);
}
.kmc-header__crest {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}
.kmc-crest { display: block; overflow: visible; }
.kmc-crest__ring {
  fill: none;
  stroke: var(--kmc-silver-strong);
  stroke-width: 1;
  opacity: 0.75;
}
.kmc-crest__trunk,
.kmc-crest__bough,
.kmc-crest__deadwood {
  fill: none;
  stroke: var(--kmc-silver-text);
  stroke-width: 1.3;
  stroke-linecap: round;
  stroke-linejoin: round;
}
/* Dead wood is thinner and dimmer — the withered half must read as withered. */
.kmc-crest__deadwood { stroke-width: 1; opacity: 0.55; }
.kmc-crest__bough { stroke-width: 1; opacity: 0.7; }
/* The living canopy is the one filled mass, tinted with the cravat rose. */
.kmc-crest__canopy {
  fill: var(--kmc-accent);
  fill-opacity: 0.30;
  stroke: var(--kmc-silver-text);
  stroke-width: 1.2;
  stroke-linejoin: round;
}
.kmc-header__titles { flex: 1 1 auto; min-width: 0; }
.kmc-header__title {
  margin: 0;
  font-family: var(--kmc-display);
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--kmc-text);
  overflow-wrap: anywhere;
}
.kmc-header__subtitle {
  margin: 1px 0 0;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--kmc-silver-text);
  opacity: 0.72;
  overflow-wrap: anywhere;
}
.kmc-close {
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  line-height: 1;
  color: var(--kmc-text-dim);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
}
.kmc-close:focus-visible, .kmc-close:active { border-color: var(--kmc-border-strong); color: var(--kmc-text); }

/* ── Body ───────────────────────────────────────────────────────────────────────── */
.kmc-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  padding: 18px;
}
.kmc-prose { margin: 0; color: var(--kmc-text-dim); }
.kmc-prose p { margin: 0 0 12px; }
.kmc-prose p:last-child { margin-bottom: 0; }

.kmc-step-title {
  margin: 0 0 8px;
  font-family: var(--kmc-display);
  font-size: 21px;
  font-weight: 600;
  letter-spacing: 0.03em;
  color: var(--kmc-text);
}
.kmc-step-desc { margin: 0 0 16px; font-size: 13px; color: var(--kmc-text-dim); }

/* ── Progress ───────────────────────────────────────────────────────────────────── */
.kmc-progress { display: flex; gap: 3px; padding: 12px 18px 13px; flex: 0 0 auto; background: transparent; }
.kmc-progress__pip {
  flex: 1 1 0; height: 3px; border-radius: 2px;
  background: var(--kmc-border);
  transition: background-color var(--kmc-ease);
}
.kmc-progress__pip--done { background: var(--kmc-accent-dim); }
.kmc-progress__pip--current { background: var(--kmc-accent); box-shadow: 0 0 6px rgba(192, 74, 99, 0.5); }

/* ── Options ────────────────────────────────────────────────────────────────────── */
.kmc-options { display: flex; flex-direction: column; gap: 10px; }
.kmc-option {
  position: relative;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  min-height: 52px;
  padding: 12px 14px;
  background: var(--kmc-bg-raised);
  border: 1px solid var(--kmc-border);
  border-radius: var(--kmc-radius);
  box-shadow: inset 0 0 0 1px var(--kmc-silver);
  cursor: pointer;
  text-align: left;
  width: 100%;
  color: inherit;
  font: inherit;
  overflow: hidden;
  transition:
    border-color var(--kmc-ease),
    background-color var(--kmc-ease),
    box-shadow var(--kmc-ease);
}
/* The rose cravat: a solid bar on the leading edge of the chosen option. */
.kmc-option::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  background: var(--kmc-accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--kmc-ease);
}
.kmc-option--selected {
  border-color: var(--kmc-accent);
  background: #1b2620;
  box-shadow: inset 0 0 0 1px var(--kmc-silver-strong);
}
.kmc-option--selected::before { transform: scaleX(1); }
.kmc-option:focus-visible { outline: 2px solid var(--kmc-accent-hi); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  .kmc-option, .kmc-option::before { transition: none; }
}
.kmc-option__mark {
  flex: 0 0 auto;
  width: 18px; height: 18px;
  margin-top: 2px;
  border-radius: 50%;
  border: 2px solid var(--kmc-border-strong);
  display: flex; align-items: center; justify-content: center;
}
.kmc-option--multi .kmc-option__mark { border-radius: 5px; }
.kmc-option--selected .kmc-option__mark { border-color: var(--kmc-accent); }
.kmc-option__mark { transition: border-color var(--kmc-ease); }
.kmc-option--selected .kmc-option__mark::after {
  content: ""; width: 8px; height: 8px; border-radius: inherit; background: var(--kmc-accent);
}
.kmc-option__body { flex: 1 1 auto; min-width: 0; }
.kmc-option__label { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-weight: 500; }
.kmc-option__desc { margin-top: 3px; font-size: 12.5px; color: var(--kmc-text-dim); overflow-wrap: anywhere; }
.kmc-chip {
  font-size: 11px; font-weight: 600; letter-spacing: 0.04em;
  padding: 1px 8px; border-radius: 999px;
  color: var(--kmc-accent-hi); background: var(--kmc-accent-dim);
  box-shadow: inset 0 0 0 1px var(--kmc-silver-strong);
}
/* A row of secondary buttons under a block of output. */
.kmc-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }

/* Discouraged, not disabled — reads as an aside rather than as an accent. */
.kmc-chip--muted {
  color: var(--kmc-text-dim); background: transparent;
  box-shadow: inset 0 0 0 1px var(--kmc-silver-strong);
}

.kmc-input, .kmc-textarea {
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  color: var(--kmc-text);
  background: var(--kmc-bg-inset);
  border: 1px solid var(--kmc-border);
  border-radius: 8px;
  font: inherit;
  resize: vertical;
}
.kmc-textarea { min-height: 96px; }
.kmc-input:focus, .kmc-textarea:focus {
  outline: none;
  border-color: var(--kmc-accent);
  box-shadow: 0 0 0 3px rgba(192, 74, 99, 0.18);
}
.kmc-input, .kmc-textarea { transition: border-color var(--kmc-ease), box-shadow var(--kmc-ease); }

.kmc-counter {
  margin-top: 6px;
  text-align: right;
  font-size: 12px;
  color: var(--kmc-text-faint);
  font-variant-numeric: tabular-nums;
  transition: color var(--kmc-ease);
}
/* Target reached — the one place a plain counter earns some colour. */
.kmc-counter--met { color: var(--kmc-ok); }

/*
 * A statement the user must not skim past. Sized well above body copy and marked with the
 * rose edge, so it reads as a boundary rather than as more explanation.
 */
.kmc-notice {
  margin-top: 20px;
  padding: 14px 16px;
  border-radius: var(--kmc-radius);
  border: 1px solid var(--kmc-accent);
  border-left-width: 4px;
  background: var(--kmc-accent-dim);
  box-shadow: inset 0 0 0 1px var(--kmc-silver);
  color: var(--kmc-text);
  font-family: var(--kmc-display);
  font-size: 19px;
  font-weight: 600;
  line-height: 1.6;
  letter-spacing: 0.02em;
}
/*
 * The loudest thing the panel can say.
 *
 * Reserved for a statement that makes the difference between the preset working and not,
 * so it is red TEXT and not merely a red border like the plain notice. Contrast against
 * --kmc-bg (#0e1512) is roughly 6:1, which clears AA at this size.
 */
.kmc-notice--danger {
  border-color: var(--kmc-danger);
  background: rgba(255, 107, 122, 0.10);
  box-shadow: inset 0 0 0 1px rgba(255, 107, 122, 0.22);
  color: var(--kmc-danger);
  font-size: 22px;
  font-weight: 700;
}

.kmc-notice p { margin: 0 0 8px; }
.kmc-notice p:last-child { margin-bottom: 0; }

.kmc-footer__hint:empty { display: none; }
.kmc-footer__hint {
  margin-right: 12px;
  color: var(--kmc-danger);
  font-size: 13px;
  line-height: 1.4;
  align-self: center;
}

.kmc-help { margin-top: 14px; }
.kmc-disclosure { margin-top: 12px; border: 1px solid var(--kmc-border); border-radius: 8px; background: var(--kmc-bg-inset); }
.kmc-disclosure > summary {
  padding: 10px 12px; cursor: pointer; font-size: 13px; color: var(--kmc-text-dim);
  list-style: none; min-height: 40px; display: flex; align-items: center;
}
.kmc-disclosure > summary::-webkit-details-marker { display: none; }
.kmc-disclosure > summary::before { content: "▸ "; margin-right: 6px; }
.kmc-disclosure[open] > summary::before { content: "▾ "; }
.kmc-disclosure > *:not(summary) { padding: 0 12px 12px; }

/* ── Footer ─────────────────────────────────────────────────────────────────────── */
.kmc-footer {
  display: flex; gap: 10px; flex-wrap: wrap;
  padding: 14px 18px;
  border-top: 1px solid var(--kmc-border);
  box-shadow: inset 0 1px 0 var(--kmc-silver);
  background: linear-gradient(0deg, rgba(208, 219, 212, 0.04), transparent);
  flex: 0 0 auto;
}
.kmc-footer__spacer { flex: 1 1 auto; }

.kmc-btn {
  min-height: 44px;
  padding: 10px 18px;
  border-radius: 8px;
  border: 1px solid var(--kmc-border-strong);
  background: var(--kmc-bg-inset);
  box-shadow: inset 0 0 0 1px var(--kmc-silver);
  color: var(--kmc-text);
  font: inherit;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  flex: 0 1 auto;
  transition: background-color var(--kmc-ease), border-color var(--kmc-ease), filter var(--kmc-ease);
}
.kmc-btn:focus-visible { outline: 2px solid var(--kmc-accent-hi); outline-offset: 2px; }
.kmc-btn:active { filter: brightness(1.12); }
.kmc-btn[disabled] { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
.kmc-btn--primary {
  background: var(--kmc-accent);
  border-color: var(--kmc-accent);
  box-shadow: inset 0 0 0 1px var(--kmc-silver-strong);
  color: #12100f;
  font-weight: 600;
}
.kmc-btn--ghost { background: transparent; border-color: transparent; box-shadow: none; color: var(--kmc-text-dim); }
.kmc-btn--danger { border-color: #6d3a2c; color: var(--kmc-error); }
@media (prefers-reduced-motion: reduce) { .kmc-btn { transition: none; } }

/* ── Tabs ───────────────────────────────────────────────────────────────────────── */
.kmc-tabs {
  display: flex; gap: 2px;
  padding: 0 12px;
  border-bottom: 1px solid var(--kmc-border);
  background: transparent;
  overflow-x: auto;
  flex: 0 0 auto;
  scrollbar-width: none;
}
.kmc-tabs::-webkit-scrollbar { display: none; }
.kmc-tab {
  flex: 0 0 auto;
  min-height: 44px;
  padding: 10px 14px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--kmc-text-dim);
  font: inherit;
  font-size: 13px;
  letter-spacing: 0.08em;
  cursor: pointer;
  white-space: nowrap;
}
.kmc-tab--active { color: var(--kmc-text); border-bottom-color: var(--kmc-accent); font-weight: 600; }
.kmc-tab { transition: color var(--kmc-ease), border-color var(--kmc-ease); }
.kmc-tab:focus-visible { outline: 2px solid var(--kmc-accent-hi); outline-offset: -2px; }

/* ── Field rows / summaries ─────────────────────────────────────────────────────── */
.kmc-section { margin-bottom: 22px; }
.kmc-section:last-child { margin-bottom: 0; }
.kmc-section__title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 10px;
  font-size: 10.5px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--kmc-silver-text);
  opacity: 0.72;
}
/* Trailing hairline, so a label reads as an engraved divider rather than small text. */
.kmc-section__title::after {
  content: "";
  flex: 1 1 auto;
  height: 1px;
  background: linear-gradient(90deg, var(--kmc-silver-strong), transparent);
}
.kmc-rows {
  display: flex; flex-direction: column;
  border: 1px solid var(--kmc-border);
  border-radius: var(--kmc-radius);
  box-shadow: inset 0 0 0 1px var(--kmc-silver);
  overflow: hidden;
}
.kmc-row {
  display: flex; gap: 12px; align-items: baseline;
  padding: 10px 14px;
  background: var(--kmc-bg-raised);
  border-bottom: 1px solid var(--kmc-border);
}
.kmc-row:last-child { border-bottom: none; }
.kmc-row__label { flex: 0 0 40%; max-width: 180px; color: var(--kmc-text-dim); font-size: 13px; }
.kmc-row__value { flex: 1 1 auto; min-width: 0; overflow-wrap: anywhere; }
.kmc-row__value--mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12.5px; }

/* ── Diff ───────────────────────────────────────────────────────────────────────── */
.kmc-diff { display: flex; flex-direction: column; gap: 8px; }
.kmc-diff__item {
  display: flex; gap: 10px; align-items: flex-start;
  padding: 9px 12px;
  background: var(--kmc-bg-raised);
  border: 1px solid var(--kmc-border);
  border-radius: 8px;
  box-shadow: inset 0 0 0 1px var(--kmc-silver);
}
.kmc-diff__glyph { flex: 0 0 auto; width: 16px; text-align: center; font-weight: 700; }
.kmc-diff__glyph--on { color: var(--kmc-ok); }
.kmc-diff__glyph--off { color: var(--kmc-text-faint); }
.kmc-diff__body { flex: 1 1 auto; min-width: 0; }
.kmc-diff__name { overflow-wrap: anywhere; }
.kmc-diff__desc { font-size: 12px; color: var(--kmc-text-dim); margin-top: 2px; overflow-wrap: anywhere; }

/* ── Status / callouts ──────────────────────────────────────────────────────────── */
.kmc-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 7px; vertical-align: middle; }
.kmc-dot--ok { background: var(--kmc-ok); }
.kmc-dot--warn { background: var(--kmc-warn); }
.kmc-dot--error { background: var(--kmc-error); }
.kmc-dot--unknown { background: var(--kmc-text-faint); }

.kmc-callout {
  padding: 12px 14px;
  border-radius: var(--kmc-radius);
  border: 1px solid var(--kmc-border);
  background: var(--kmc-bg-raised);
  font-size: 13px;
  color: var(--kmc-text-dim);
}
.kmc-callout--ok { border-color: #2f5d43; background: #142219; color: #bfe6cd; }
.kmc-callout--warn { border-color: #6b5a20; background: #221e12; color: #f0e0aa; }
.kmc-callout--error { border-color: #7a3a2a; background: #241611; color: #f5cbbd; }
.kmc-callout__title { font-weight: 600; color: inherit; margin-bottom: 4px; }

.kmc-banner { margin-bottom: 16px; }

/* ── Diagnostic step list ───────────────────────────────────────────────────────── */
.kmc-steps { display: flex; flex-direction: column; gap: 7px; }
.kmc-steps__item { display: flex; gap: 10px; align-items: baseline; font-size: 13.5px; }
.kmc-steps__glyph { flex: 0 0 auto; width: 16px; text-align: center; }
.kmc-steps__glyph--ok { color: var(--kmc-ok); }
.kmc-steps__glyph--failed { color: var(--kmc-error); }
.kmc-steps__glyph--unavailable { color: var(--kmc-text-faint); }
.kmc-steps__glyph--running { color: var(--kmc-accent); }
.kmc-steps__glyph--pending { color: var(--kmc-text-faint); }
.kmc-steps__label { flex: 1 1 auto; min-width: 0; overflow-wrap: anywhere; }
.kmc-steps__note { color: var(--kmc-text-faint); font-size: 12px; overflow-wrap: anywhere; }
.kmc-steps__item--pending .kmc-steps__label { color: var(--kmc-text-faint); }

/* ── Raw error block ────────────────────────────────────────────────────────────── */
.kmc-pre {
  margin: 0;
  padding: 12px;
  background: var(--kmc-bg-inset);
  border: 1px solid var(--kmc-border);
  border-radius: 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.5;
  color: var(--kmc-text-dim);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  max-height: 260px;
  overflow: auto;
}

/* ── History ────────────────────────────────────────────────────────────────────── */
.kmc-history { display: flex; flex-direction: column; gap: 6px; }
.kmc-history__item {
  display: flex; gap: 10px; align-items: center;
  min-height: 44px;
  padding: 8px 12px;
  background: var(--kmc-bg-raised);
  border: 1px solid var(--kmc-border);
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  color: inherit;
  font: inherit;
  width: 100%;
}
.kmc-history__time { flex: 0 0 auto; color: var(--kmc-text-faint); font-variant-numeric: tabular-nums; font-size: 12.5px; }
.kmc-history__label { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.kmc-empty { padding: 22px 12px; text-align: center; color: var(--kmc-text-faint); font-size: 13px; }

/* ── Spinner ────────────────────────────────────────────────────────────────────── */
.kmc-spinner {
  display: inline-block; width: 13px; height: 13px;
  border: 2px solid var(--kmc-accent-dim);
  border-top-color: var(--kmc-accent);
  border-radius: 50%;
  animation: kmc-spin 0.7s linear infinite;
  vertical-align: -2px;
}
@keyframes kmc-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .kmc-spinner { animation-duration: 2.4s; }
}

/* ── Narrow screens ─────────────────────────────────────────────────────────────── */

/*
 * A fixed, inset:0 overlay tracks the LAYOUT viewport, which on iOS extends underneath the
 * browser's collapsing toolbars — the footer ends up off-screen. dvh tracks the visible
 * viewport instead. Guarded, because it is the only unit that behaves this way.
 * (No backticks in this file: the whole stylesheet is one template literal.)
 */
@supports (height: 100dvh) {
  .kmc-root { bottom: auto; height: 100dvh; }
}

@media (max-width: 560px) {
  .kmc-root {
    padding: 0;
    /* Blur over a full-screen surface is a real cost on phones and buys nothing here. */
    backdrop-filter: none;
    background: rgba(6, 11, 9, 0.9);
  }
  .kmc-modal {
    max-width: none;
    height: 100%;
    max-height: 100%;
    border: none;
    border-radius: 0;
  }
  /* Corner brackets frame a card. On a full-bleed sheet there is no card to frame. */
  .kmc-modal::before, .kmc-modal::after { display: none; }

  .kmc-header, .kmc-body, .kmc-footer, .kmc-progress { padding-left: 14px; padding-right: 14px; }
  .kmc-header::after { left: 14px; right: 14px; }
  .kmc-header { gap: 10px; }
  .kmc-header__title { font-size: 17px; }
  .kmc-header__crest svg { width: 24px; height: 24px; }

  /* 34px is under the 44px touch minimum — the close button is the easiest thing to miss. */
  .kmc-close { width: 44px; height: 44px; margin-right: -8px; }

  .kmc-step-title { font-size: 19px; }
  .kmc-notice { font-size: 16px; padding: 12px 14px; }
  .kmc-notice--danger { font-size: 18px; }

  .kmc-row { flex-direction: column; gap: 2px; }
  .kmc-row__label { flex-basis: auto; max-width: none; font-size: 12px; }

  .kmc-footer {
    flex-wrap: wrap;
    /* Clear the home indicator on notched phones. */
    padding-bottom: calc(14px + env(safe-area-inset-bottom, 0px));
  }
  .kmc-footer .kmc-btn { flex: 1 1 140px; }
  .kmc-footer__spacer { display: none; }

  /*
   * iOS Safari zooms the whole page when a focused field is under 16px. That zoom is not
   * undone on blur, so one tap on a text box leaves the panel permanently magnified.
   */
  .kmc-input, .kmc-textarea { font-size: 16px; }
  .kmc-textarea { min-height: 140px; }

  /* Keep a focused field clear of the sticky footer and the on-screen keyboard. */
  .kmc-input, .kmc-textarea, .kmc-option { scroll-margin-block: 16px 90px; }

  .kmc-pre { max-height: 200px; font-size: 11.5px; }
  .kmc-tab { padding: 10px 12px; }
}

/*
 * Landscape phones: the sheet is short, so give the scrolling body every pixel and let the
 * chrome shrink rather than squeezing the content to nothing.
 */
@media (max-height: 460px) and (orientation: landscape) {
  .kmc-header { padding-top: 9px; padding-bottom: 8px; }
  .kmc-header__title { font-size: 15px; }
  .kmc-header__subtitle { display: none; }
  .kmc-header__crest svg { width: 20px; height: 20px; }
  .kmc-progress { padding-top: 8px; padding-bottom: 8px; }
  .kmc-body { padding-top: 12px; padding-bottom: 12px; }
  .kmc-footer { padding-top: 9px; padding-bottom: calc(9px + env(safe-area-inset-bottom, 0px)); }
  .kmc-btn { min-height: 40px; padding: 8px 14px; }
  .kmc-step-title { font-size: 17px; margin-bottom: 4px; }
}
`;
  const TAB_LABELS = [
    ["overview", "概览"],
    ["reconfigure", "重新配置"],
    ["diagnostics", "诊断"],
    ["about", "关于"]
  ];
  class App {
    constructor(hostDocument2) {
      this.hostDocument = hostDocument2;
      setHostDocument(hostDocument2);
    }
    root;
    titleNode;
    subtitleNode;
    bodyNode;
    footerNode;
    progressNode;
    tabsNode;
    route = { name: "dashboard", tab: "overview" };
    onboarding;
    keydownHandler;
    disposed = false;
    get isOpen() {
      return this.root !== void 0;
    }
    // ---------------------------------------------------------------------------------
    // Lifecycle
    // ---------------------------------------------------------------------------------
    open(route) {
      if (this.disposed) return;
      this.route = route;
      if (route.name === "onboarding") {
        this.onboarding = new OnboardingFlow(this.shell());
      }
      this.mount();
      this.render();
    }
    close() {
      this.unmount();
    }
    /** Full teardown. After this the instance must not be reused. */
    dispose() {
      this.disposed = true;
      this.unmount();
      this.removeStyles();
    }
    mount() {
      if (this.root) return;
      this.ensureStyles();
      let pressBeganOnBackdrop = false;
      const root = el("div", {
        class: "kmc-root",
        attrs: { role: "dialog", "aria-modal": "true", "aria-label": presetIdentity.displayName },
        on: {
          pointerdown: (event) => {
            pressBeganOnBackdrop = event.target === root;
          },
          click: (event) => {
            const wasBackdropTap = pressBeganOnBackdrop && event.target === root;
            pressBeganOnBackdrop = false;
            if (wasBackdropTap) this.close();
          }
        }
      });
      const modal = el("div", { class: "kmc-modal" });
      const titleNode = el("h2", { class: "kmc-header__title" });
      const subtitleNode = el("p", { class: "kmc-header__subtitle" });
      const bodyNode = el("div", { class: "kmc-body" });
      const footerNode = el("div", { class: "kmc-footer" });
      const progressNode = el("div", { class: "kmc-progress" });
      const tabsNode = el("div", { class: "kmc-tabs" });
      append(
        modal,
        el(
          "div",
          { class: "kmc-header" },
          el("div", { class: "kmc-header__crest" }, renderCrest(30)),
          el("div", { class: "kmc-header__titles" }, titleNode, subtitleNode),
          el("button", {
            class: "kmc-close",
            text: "×",
            attrs: { type: "button", "aria-label": "关闭" },
            on: { click: () => this.close() }
          })
        ),
        progressNode,
        tabsNode,
        bodyNode,
        footerNode
      );
      root.appendChild(modal);
      this.hostDocument.body.appendChild(root);
      this.keydownHandler = (event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          this.close();
        }
      };
      this.hostDocument.addEventListener("keydown", this.keydownHandler, true);
      this.root = root;
      this.titleNode = titleNode;
      this.subtitleNode = subtitleNode;
      this.bodyNode = bodyNode;
      this.footerNode = footerNode;
      this.progressNode = progressNode;
      this.tabsNode = tabsNode;
    }
    unmount() {
      if (this.keydownHandler) {
        this.hostDocument.removeEventListener("keydown", this.keydownHandler, true);
        this.keydownHandler = void 0;
      }
      this.root?.remove();
      this.root = void 0;
      this.titleNode = void 0;
      this.subtitleNode = void 0;
      this.bodyNode = void 0;
      this.footerNode = void 0;
      this.progressNode = void 0;
      this.tabsNode = void 0;
      this.onboarding = void 0;
    }
    ensureStyles() {
      if (this.hostDocument.getElementById(STYLE_ELEMENT_ID)) return;
      const style = this.hostDocument.createElement("style");
      style.id = STYLE_ELEMENT_ID;
      style.textContent = styles;
      this.hostDocument.head.appendChild(style);
    }
    removeStyles() {
      this.hostDocument.getElementById(STYLE_ELEMENT_ID)?.remove();
    }
    // ---------------------------------------------------------------------------------
    // Shell API handed to views
    // ---------------------------------------------------------------------------------
    shell() {
      return {
        setTitle: (title, subtitle) => {
          if (this.titleNode) this.titleNode.textContent = title;
          if (this.subtitleNode) {
            this.subtitleNode.textContent = subtitle ?? "";
            this.subtitleNode.style.display = subtitle ? "" : "none";
          }
        },
        setBody: (node) => {
          if (!this.bodyNode) return;
          clear(this.bodyNode);
          this.bodyNode.appendChild(node);
          this.bodyNode.scrollTop = 0;
        },
        setFooter: (nodes) => {
          if (!this.footerNode) return;
          clear(this.footerNode);
          append(this.footerNode, ...nodes);
          this.footerNode.style.display = this.footerNode.childNodes.length ? "" : "none";
        },
        setProgress: (current, total) => {
          if (!this.progressNode) return;
          clear(this.progressNode);
          if (total <= 1) {
            this.progressNode.style.display = "none";
            return;
          }
          this.progressNode.style.display = "";
          for (let index = 0; index < total; index += 1) {
            const state = index < current ? "done" : index === current ? "current" : "todo";
            this.progressNode.appendChild(
              el("div", { class: `kmc-progress__pip kmc-progress__pip--${state}` })
            );
          }
        },
        navigate: (route) => {
          this.route = route;
          this.onboarding = route.name === "onboarding" ? new OnboardingFlow(this.shell()) : void 0;
          this.render();
        },
        close: () => this.close(),
        requestRender: () => this.render()
      };
    }
    // ---------------------------------------------------------------------------------
    // Rendering
    // ---------------------------------------------------------------------------------
    render() {
      if (!this.root) return;
      const shell = this.shell();
      try {
        this.renderTabs();
        switch (this.route.name) {
          case "onboarding": {
            if (!this.onboarding) {
              this.onboarding = new OnboardingFlow(shell);
            }
            this.onboarding.render();
            break;
          }
          case "dashboard": {
            shell.setProgress(0, 0);
            shell.setTitle(presetIdentity.displayName, "预设控制台");
            switch (this.route.tab) {
              case "overview":
                renderOverview(shell);
                break;
              case "reconfigure":
                renderReconfigure(shell);
                break;
              case "diagnostics":
                renderDiagnostics(shell);
                break;
              case "about":
                renderAbout(shell);
                break;
            }
            break;
          }
          case "fallback":
            shell.setProgress(0, 0);
            renderFallback(shell, this.route.error);
            break;
        }
      } catch (error) {
        eventLog.error("panel render failed", error instanceof Error ? error.message : error);
        try {
          this.route = { name: "fallback", error };
          this.renderTabs();
          renderFallback(shell, error);
        } catch {
        }
      }
    }
    renderTabs() {
      if (!this.tabsNode) return;
      clear(this.tabsNode);
      if (this.route.name !== "dashboard") {
        this.tabsNode.style.display = "none";
        return;
      }
      this.tabsNode.style.display = "";
      const activeTab = this.route.tab;
      for (const [tab, label] of TAB_LABELS) {
        this.tabsNode.appendChild(
          el("button", {
            class: `kmc-tab${tab === activeTab ? " kmc-tab--active" : ""}`,
            text: label,
            attrs: { type: "button", role: "tab", "aria-selected": tab === activeTab },
            on: { click: () => this.shell().navigate({ name: "dashboard", tab }) }
          })
        );
      }
    }
  }
  const INSTANCE_KEY = "__keminiPresetCompanion__";
  class Companion {
    app;
    disposers = [];
    disposed = false;
    /** Guards against the wizard reappearing repeatedly within one page session. */
    autoOpenedThisSession = false;
    async initialize() {
      const host = adapter.getHostDocument();
      setHostDocument(host);
      this.app = new App(host);
      eventLog.info("panel initialized");
      if (!adapter.isAvailable()) {
        eventLog.warn("TavernHelper API unavailable; companion inactive");
        return;
      }
      setTransportIncompatibleHandler((message) => {
        adapter.notify("warning", message, "防截断传输可能不适用于这条渠道");
      });
      this.registerLauncherButton();
      this.registerTransportButton();
      this.registerReevaluationHooks();
      fetchErrorInterceptor.install();
      this.disposers.push(() => fetchErrorInterceptor.dispose());
      antiTruncationInterceptor.install();
      antiTruncationInterceptor.setEnabled(settingsStore.antiTruncationEnabled);
      this.disposers.push(() => antiTruncationInterceptor.dispose());
      passiveWatcher.start();
      this.disposers.push(() => passiveWatcher.dispose());
      await this.waitForTavernReady();
      this.maybeAutoOpenOnboarding();
    }
    // ---------------------------------------------------------------------------------
    // Wiring
    // ---------------------------------------------------------------------------------
    registerLauncherButton() {
      const eventName = adapter.ensureButton(LAUNCHER_BUTTON_NAME);
      if (!eventName) {
        eventLog.warn("launcher button unavailable (not a script context?)");
        return;
      }
      this.disposers.push(
        adapter.listenEvent(eventName, () => this.openConsole())
      );
      eventLog.info(`launcher button registered: ${LAUNCHER_BUTTON_NAME}`);
    }
    /**
     * Second button: flip the transport without opening the panel.
     *
     * It is deliberately NOT self-disabling. A channel that cannot carry the transport is
     * reported (see `warnIfChannelRejectsTransport`) but the switch stays where the user put
     * it — the panel does not get to overrule a deliberate choice on one bad generation.
     */
    registerTransportButton() {
      const eventName = adapter.ensureButton(TRANSPORT_BUTTON_NAME);
      if (!eventName) return;
      this.disposers.push(
        adapter.listenEvent(eventName, () => {
          const next = !settingsStore.antiTruncationEnabled;
          settingsStore.setAntiTruncationEnabled(next);
          antiTruncationInterceptor.setEnabled(next);
          adapter.notify(
            next ? "success" : "info",
            next ? "回复将经由合成函数参数传回" : "恢复渠道原本的输出方式",
            `防截断传输已${next ? "开启" : "关闭"}`
          );
          this.refreshTransportButtonLabel();
        })
      );
      this.refreshTransportButtonLabel();
      eventLog.info(`transport button registered: ${TRANSPORT_BUTTON_NAME}`);
    }
    /**
     * Show the current state in the button caption.
     *
     * TavernHelper has no API to relabel a registered button, so the caption is edited in the
     * host document directly. Entirely best-effort: the toggle and its toast work regardless,
     * and a failure here must never surface.
     */
    refreshTransportButtonLabel() {
      try {
        const on = settingsStore.antiTruncationEnabled;
        const doc = adapter.getHostDocument();
        for (const node of doc.querySelectorAll(".qr--button-label, .qr--button")) {
          const text = node.textContent ?? "";
          if (!text.startsWith(TRANSPORT_BUTTON_NAME)) continue;
          node.textContent = `${TRANSPORT_BUTTON_NAME} ${on ? "开" : "关"}`;
          return;
        }
      } catch {
      }
    }
    /**
     * Re-check identity when the user switches preset or chat.
     *
     * A user may enable the script while a different preset is loaded and only later switch
     * to ours; without this the wizard would never appear. `autoOpenedThisSession` keeps it
     * to at most one automatic appearance per page load.
     */
    registerReevaluationHooks() {
      for (const key of ["OAI_PRESET_CHANGED_AFTER", "CHAT_CHANGED"]) {
        const eventName = adapter.eventName("tavern", key);
        if (!eventName) continue;
        this.disposers.push(
          adapter.listenEvent(eventName, () => {
            if (!this.disposed) this.maybeAutoOpenOnboarding();
          })
        );
      }
    }
    /**
     * Wait until the preset is actually readable.
     *
     * At script start SillyTavern may still be loading settings, so `getPreset('in_use')`
     * can legitimately fail for a moment. Poll briefly rather than assume, and give up
     * quietly — a missing preset is handled everywhere downstream.
     */
    async waitForTavernReady(timeoutMs = 15e3) {
      const deadline = Date.now() + timeoutMs;
      while (Date.now() < deadline && !this.disposed) {
        if (adapter.getCurrentPreset()) {
          eventLog.info("preset detected");
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
      eventLog.warn("preset not readable before timeout");
    }
    // ---------------------------------------------------------------------------------
    // Entry points
    // ---------------------------------------------------------------------------------
    maybeAutoOpenOnboarding() {
      if (this.disposed || this.autoOpenedThisSession) return;
      if (settingsStore.onboardingCompleted) return;
      const validation = presetService.validateCurrentPreset();
      if (validation.status !== "ok") {
        return;
      }
      this.autoOpenedThisSession = true;
      eventLog.info(`onboarding auto-opened (matched by ${validation.matchedBy})`);
      this.openOnboarding();
    }
    openOnboarding() {
      try {
        resetDiagnosticsView();
        this.app?.open({ name: "onboarding" });
      } catch (error) {
        this.openFallback(error);
      }
    }
    openConsole() {
      try {
        resetDiagnosticsView();
        if (!settingsStore.onboardingCompleted) {
          this.autoOpenedThisSession = true;
          this.app?.open({ name: "onboarding" });
          return;
        }
        this.app?.open({ name: "dashboard", tab: "overview" });
      } catch (error) {
        this.openFallback(error);
      }
    }
    openFallback(error) {
      eventLog.error("panel failed to open", error instanceof Error ? error.message : error);
      try {
        this.app?.open({ name: "fallback", error });
      } catch {
        adapter.notify(
          "error",
          `${presetIdentity.displayName} 面板无法打开：${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
    // ---------------------------------------------------------------------------------
    // Teardown
    // ---------------------------------------------------------------------------------
    dispose() {
      if (this.disposed) return;
      this.disposed = true;
      for (const dispose of this.disposers) {
        try {
          dispose();
        } catch (error) {
          eventLog.warn("dispose step failed", error);
        }
      }
      this.disposers = [];
      try {
        this.app?.dispose();
      } catch {
      }
      this.app = void 0;
      eventLog.info("panel disposed");
    }
  }
  function bootstrap() {
    const registry = (() => {
      try {
        return window.parent ?? window;
      } catch {
        return window;
      }
    })();
    const previous = registry[INSTANCE_KEY];
    if (previous) {
      try {
        previous.dispose();
      } catch {
      }
      delete registry[INSTANCE_KEY];
    }
    const companion = new Companion();
    registry[INSTANCE_KEY] = {
      dispose: () => companion.dispose(),
      version: "0.1.0"
    };
    window.addEventListener("pagehide", () => {
      companion.dispose();
      delete registry[INSTANCE_KEY];
    });
    void companion.initialize().catch((error) => {
      eventLog.error("initialization failed", error instanceof Error ? error.message : error);
    });
  }
  try {
    bootstrap();
  } catch (error) {
    console.error("[Kemini] bootstrap failed", error);
  }
})();
