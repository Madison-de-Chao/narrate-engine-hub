/**
 * 故事素材管理器
 * 統一管理角色、神煞、提示詞等故事生成素材
 * 參考 StoryMaterialsManager-2.ts 設計，適配前端環境
 */

import charactersData from '@/data/characters.json';
import shenshaCompleteData from '@/data/shensha_complete.json';
import promptsData from '@/data/prompts.json';

import type {
  CharacterData,
  ShenshaData,
  PromptsData,
  GanRole,
  ZhiRole,
  ShenshaEffect,
  LegionContext,
  StoryGenerationRequest,
  StoryGenerationResult,
  SupportedLanguage,
  StoryType,
  AdviceTemplates,
} from './types';

// 軍團上下文配置
const LEGION_CONTEXTS: Record<string, LegionContext> = {
  year: {
    name: '祖源軍團',
    stage: '童年至青少年',
    domain: '家族傳承、童年環境、祖輩影響、早期價值觀形成',
    focus: '根基與起點',
  },
  month: {
    name: '關係軍團',
    stage: '青年至中年',
    domain: '社會關係、事業發展、人際互動、社會地位建立',
    focus: '成長與拓展',
  },
  day: {
    name: '核心軍團',
    stage: '成年核心期',
    domain: '個人特質、婚姻感情、核心自我、內在品格',
    focus: '本質與實現',
  },
  hour: {
    name: '未來軍團',
    stage: '中年至晚年',
    domain: '未來規劃、子女關係、晚年運勢、智慧傳承',
    focus: '展望與延續',
  },
};

// 天干軍團故事擴展屬性
const GAN_STORY_EXTENSIONS: Record<string, Partial<GanRole>> = {
  甲: { image: '參天大樹，堅毅直立', style: '重承諾，敢開疆拓土', buff: '規劃長遠', debuff: '剛愎自用' },
  乙: { image: '藤蔓花草，柔韌適應', style: '協調圓融，善於美化', buff: '靈活應變', debuff: '過度依附' },
  丙: { image: '太陽，光明外放', style: '熱情奔放，感染全軍', buff: '激勵士氣', debuff: '燒盡自己' },
  丁: { image: '溫柔燭火，能照亮黑暗', style: '細膩體貼，擅啟蒙', buff: '溫暖療癒', debuff: '情緒波動' },
  戊: { image: '高山厚土，穩重承載', style: '可靠堅實，能守護全軍', buff: '穩定防禦', debuff: '固執僵化' },
  己: { image: '田園沃土，滋養萬物', style: '包容細膩，善於培育', buff: '滋養培育', debuff: '過度犧牲' },
  庚: { image: '礦石鋼鐵，剛健果決', style: '直接強硬，果斷決斷', buff: '一擊必中', debuff: '剛硬破裂' },
  辛: { image: '珠玉寶石，精緻優雅', style: '重視品質，善於鑑賞', buff: '精緻完美', debuff: '苛刻敏感' },
  壬: { image: '江河大海，奔放靈活', style: '胸懷寬廣，靈活多變', buff: '靈動探索', debuff: '隨波逐流' },
  癸: { image: '雨露泉水，潤物無聲', style: '溫柔細膩，智慧含蓄', buff: '細膩滋養', debuff: '多愁善感' },
};

// 地支軍團故事擴展屬性
const ZHI_STORY_EXTENSIONS: Record<string, Partial<ZhiRole>> = {
  子: { symbol: '冬至之水，潛藏黑夜', character: '聰明靈活，反應快', buff: '瞬間奇襲', debuff: '易動不安' },
  丑: { symbol: '寒冬大地，厚重封藏', character: '勤勞耐力，穩中帶剛', buff: '後勤補給', debuff: '遲疑不決' },
  寅: { symbol: '春雷初動，草木萌發', character: '勇猛果敢，開創力強', buff: '先鋒衝陣', debuff: '草率行事' },
  卯: { symbol: '春花盛開，柔美雅靜', character: '溫文儒雅，和諧共處', buff: '和諧調解', debuff: '優柔被動' },
  辰: { symbol: '水土交雜，能量複合', character: '多才多變，能容納百川', buff: '變化萬端', debuff: '自相矛盾' },
  巳: { symbol: '夏日將至，熱力蘊藏', character: '聰慧靈動，足智多謀', buff: '謀略之眼', debuff: '多疑內耗' },
  午: { symbol: '盛夏正陽，光明外放', character: '熱情奔放，行動力強', buff: '士氣高昂', debuff: '精力耗盡' },
  未: { symbol: '夏末收成，和氣守成', character: '溫和耐心，注重和諧', buff: '調和人心', debuff: '猶疑不決' },
  申: { symbol: '秋風肅殺，行動敏捷', character: '聰明機警，反應靈巧', buff: '隨機應變', debuff: '善變浮躁' },
  酉: { symbol: '秋收精煉，嚴謹守護', character: '細膩、注重品質，重原則', buff: '精準守護', debuff: '苛刻冷漠' },
  戌: { symbol: '深秋守土，忠誠護疆', character: '忠誠可靠，重責任', buff: '忠誠護主', debuff: '固執保守' },
  亥: { symbol: '冬水潛藏，蓄勢待發', character: '福德圓滿，寬厚仁慈', buff: '福德智慧', debuff: '逃避散漫' },
};

/**
 * 故事素材管理器類
 */
export class StoryMaterialsManager {
  private characters: CharacterData;
  private shensha: ShenshaData;
  private prompts: PromptsData;

  constructor() {
    this.characters = charactersData as CharacterData;
    this.shensha = shenshaCompleteData as unknown as ShenshaData;
    this.prompts = promptsData as unknown as PromptsData;
  }

  // ==================== 角色管理 ====================

  /**
   * 獲取天干角色（含故事擴展屬性）
   */
  getGanRole(gan: string): GanRole | null {
    const baseRole = this.characters.gan_roles[gan];
    if (!baseRole) return null;

    const extensions = GAN_STORY_EXTENSIONS[gan] || {};
    return { ...baseRole, ...extensions };
  }

  /**
   * 獲取地支角色（含故事擴展屬性）
   */
  getZhiRole(zhi: string): ZhiRole | null {
    const baseRole = this.characters.zhi_roles[zhi];
    if (!baseRole) return null;

    const extensions = ZHI_STORY_EXTENSIONS[zhi] || {};
    return { ...baseRole, ...extensions };
  }

  /**
   * 獲取所有天干角色
   */
  getAllGanRoles(): Record<string, GanRole> {
    const result: Record<string, GanRole> = {};
    for (const gan of Object.keys(this.characters.gan_roles)) {
      const role = this.getGanRole(gan);
      if (role) result[gan] = role;
    }
    return result;
  }

  /**
   * 獲取所有地支角色
   */
  getAllZhiRoles(): Record<string, ZhiRole> {
    const result: Record<string, ZhiRole> = {};
    for (const zhi of Object.keys(this.characters.zhi_roles)) {
      const role = this.getZhiRole(zhi);
      if (role) result[zhi] = role;
    }
    return result;
  }

  // ==================== 神煞管理 ====================

  /**
   * 獲取神煞效果
   */
  getShenshaEffect(name: string): ShenshaEffect | null {
    return (this.shensha.shensha_effects as Record<string, ShenshaEffect>)[name] || null;
  }

  /**
   * 獲取神煞的柱位意義
   */
  getShenshaPillarMeaning(name: string, pillar: 'year' | 'month' | 'day' | 'hour'): string | null {
    const effect = this.getShenshaEffect(name);
    if (!effect?.pillar_meaning) return null;
    return effect.pillar_meaning[pillar] || null;
  }

  /**
   * 獲取所有吉神
   */
  getAuspiciousShensha(): ShenshaEffect[] {
    return Object.values(this.shensha.shensha_effects as Record<string, ShenshaEffect>)
      .filter((s) => s.type === '吉神');
  }

  /**
   * 獲取所有凶煞
   */
  getInauspiciousShensha(): ShenshaEffect[] {
    return Object.values(this.shensha.shensha_effects as Record<string, ShenshaEffect>)
      .filter((s) => s.type === '凶神');
  }

  /**
   * 獲取神煞按分類
   */
  getShenshaByCategory(category: string): ShenshaEffect[] {
    return Object.values(this.shensha.shensha_effects as Record<string, ShenshaEffect>)
      .filter((s) => s.category === category);
  }

  // ==================== 軍團上下文 ====================

  /**
   * 獲取軍團上下文
   */
  getLegionContext(pillarKey: 'year' | 'month' | 'day' | 'hour'): LegionContext {
    return LEGION_CONTEXTS[pillarKey];
  }

  /**
   * 獲取所有軍團上下文
   */
  getAllLegionContexts(): Record<string, LegionContext> {
    return { ...LEGION_CONTEXTS };
  }

  // ==================== 提示詞管理 ====================

  /**
   * 獲取故事模板
   */
  getStoryTemplate(type: StoryType, language: SupportedLanguage = 'zh-TW'): Record<string, string> | null {
    const templates = this.prompts.story_templates[type];
    if (!templates) return null;
    return (templates as Record<string, Record<string, string>>)[language] || null;
  }

  /**
   * 獲取 AI 提示詞配置
   */
  getAIPrompt(provider: 'openai' | 'claude', type: StoryType): { system: string; user_template: string } | null {
    const providerPrompts = this.prompts.ai_prompts[provider];
    if (!providerPrompts) return null;
    return (providerPrompts as Record<string, { system: string; user_template: string }>)[type] || null;
  }

  /**
   * 獲取建議模板
   */
  getAdviceTemplates(): AdviceTemplates {
    return this.prompts.advice_templates;
  }

  /**
   * 根據十神獲取建議
   */
  getAdviceByTenGod(tenGod: string): string[] {
    return this.prompts.advice_templates.by_ten_god[tenGod] || [];
  }

  /**
   * 根據五行獲取建議
   */
  getAdviceByElement(element: string): string[] {
    return this.prompts.advice_templates.by_element[element] || [];
  }

  // ==================== 故事生成輔助 ====================

  /**
   * 填充故事模板
   */
  fillStoryTemplate(
    template: string,
    variables: Record<string, string>
  ): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
  }

  /**
   * 構建故事生成上下文
   */
  buildStoryContext(request: StoryGenerationRequest): {
    commander: GanRole;
    strategist: ZhiRole;
    context: LegionContext;
    template: Record<string, string>;
    advice: string[];
  } | null {
    const commander = this.getGanRole(request.stem);
    const strategist = this.getZhiRole(request.branch);
    const context = this.getLegionContext(request.pillarKey);
    const template = this.getStoryTemplate('army-narrative', request.language || 'zh-TW');

    if (!commander || !strategist || !template) {
      return null;
    }

    // 獲取建議
    const advice: string[] = [];
    if (request.tenGod?.stem) {
      advice.push(...this.getAdviceByTenGod(request.tenGod.stem));
    }
    advice.push(...this.getAdviceByElement(commander.element));

    return { commander, strategist, context, template, advice };
  }

  /**
   * 生成本地故事（不調用 AI）
   */
  generateLocalStory(request: StoryGenerationRequest): StoryGenerationResult | null {
    const ctx = this.buildStoryContext(request);
    if (!ctx) return null;

    const { commander, strategist, context, template, advice } = ctx;

    // 構建變量映射
    const variables: Record<string, string> = {
      pillar_key: context.name,
      stem: request.stem,
      branch: request.branch,
      nayin: request.nayin || '未知',
      commander_title: commander.title,
      strategist_title: strategist.title,
      lieutenant_titles: request.hiddenStems?.join('、') || '藏干副將',
      shensha_list: request.shensha?.join('、') || '無',
      shensha_effects: request.shensha
        ?.map((s) => this.getShenshaEffect(s)?.effect)
        .filter(Boolean)
        .join('、') || '無',
      ten_god: request.tenGod?.stem || '未知',
      ten_god_narrative: this.getAdviceByTenGod(request.tenGod?.stem || '')[0] || '發揮自身優勢',
      advice_text: advice[Math.floor(Math.random() * advice.length)] || '順應天時，把握機遇',
    };

    // 構建故事
    const title = this.fillStoryTemplate(template.title, variables);
    const storyParts = [
      this.fillStoryTemplate(template.intro, variables),
      this.fillStoryTemplate(template.commander, variables),
      this.fillStoryTemplate(template.strategist, variables),
    ];

    if (request.hiddenStems?.length) {
      storyParts.push(this.fillStoryTemplate(template.lieutenants, variables));
    }

    if (request.shensha?.length) {
      storyParts.push(this.fillStoryTemplate(template.shensha, variables));
    }

    storyParts.push(
      this.fillStoryTemplate(template.ten_god, variables),
      this.fillStoryTemplate(template.advice, variables)
    );

    return {
      title,
      story: storyParts.join('\n\n'),
      commander: { name: request.stem, role: commander },
      strategist: { name: request.branch, role: strategist },
      context,
      advice: variables.advice_text,
    };
  }

  // ==================== 統計與調試 ====================

  /**
   * 獲取素材統計
   */
  getStats(): {
    characters: { gan: number; zhi: number };
    shensha: { total: number; auspicious: number; inauspicious: number; special: number };
    templates: { storyTypes: number };
  } {
    const shenshaList = Object.values(this.shensha.shensha_effects as Record<string, ShenshaEffect>);
    
    return {
      characters: {
        gan: Object.keys(this.characters.gan_roles).length,
        zhi: Object.keys(this.characters.zhi_roles).length,
      },
      shensha: {
        total: shenshaList.length,
        auspicious: shenshaList.filter((s) => s.type === '吉神').length,
        inauspicious: shenshaList.filter((s) => s.type === '凶神').length,
        special: shenshaList.filter((s) => s.type === '特殊').length,
      },
      templates: {
        storyTypes: Object.keys(this.prompts.story_templates).length,
      },
    };
  }
}

// 導出單例實例
export const storyMaterialsManager = new StoryMaterialsManager();
