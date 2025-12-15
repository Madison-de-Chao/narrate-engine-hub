/**
 * 故事素材管理系統 - 導出模組
 */

export { StoryMaterialsManager, storyMaterialsManager } from './StoryMaterialsManager';

export type {
  // 角色類型
  GanRole,
  ZhiRole,
  CharacterData,
  
  // 神煞類型
  ShenshaEffect,
  ShenshaCombination,
  ShenshaData,
  
  // 模板類型
  StoryTemplateSection,
  StoryTemplates,
  AIPromptConfig,
  AIPrompts,
  AdviceTemplates,
  PromptsData,
  
  // 軍團類型
  LegionContext,
  NayinBattlefield,
  BingfuCard,
  
  // 故事生成類型
  StoryGenerationRequest,
  StoryGenerationResult,
  SupportedLanguage,
  StoryType,
} from './types';
