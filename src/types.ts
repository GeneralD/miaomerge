export interface LEDConfiguration {
  pages: LEDPage[];
  [key: string]: any;
}

export interface LEDPage {
  slot: number;
  frames: LEDFrame[];
}

export interface LEDFrame {
  ledColors: string[];
  delay: number;
}

export interface FileInfo {
  name: string;
  path: string;
}

export interface MergeMapping {
  slot: number;
  action: 'keep' | 'replace' | 'combine';
  sourceFile?: string;
  targetSlot?: number;
}

export type MergeStep = 'selectBase' | 'configureMappings' | 'review' | 'complete';