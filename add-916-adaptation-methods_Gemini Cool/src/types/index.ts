export type AdaptationMethod =
  | 'smart'
  | 'compact'
  | 'split'
  | 'fit'
  | 'editorial'
  | 'heroMedia'
  | 'mediaGrid'
  | 'balanced'
  | 'typographic';

export interface MethodInfo {
  id: AdaptationMethod;
  name: string;
  badge: 'legacy' | 'new';
  direction?: string;
  shortDesc: string;
  fullDesc: string;
  targetStructures: string;
  differenceSummary: string;
}

export interface TemplateItem {
  index: number;
  tpl: string;
  family: string;
  group: string;
  label: string;
  code: string;
  icon: string;
  kind: string;
  desc: string;
  styleSystem: string;
  favorite: boolean;
  html: string;
}

export interface TemplateLibrary {
  id: string;
  name: string;
  fileName: string;
  type: string;
  templates: TemplateItem[];
  count: number;
  staticExtract?: boolean;
}

export interface OverflowIssue {
  name: string;
  reason: string;
  top?: number;
  bottom?: number;
}

export interface ConversionResult {
  outputHtml: string;
  method: AdaptationMethod;
  layout: string;
  fitFactor: number;
  overflow: OverflowIssue[];
  heightUtilizationPct: number;
  mediaCount: number;
  editableCount: number;
  executionTimeMs: number;
}

export interface Recommendation {
  method: AdaptationMethod;
  why: string;
  roles: number;
  media: number;
}
