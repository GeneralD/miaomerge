export interface LEDConfiguration {
    product_info: any;
    page_num: number;
    page_data: PageData[];
}

export interface PageData {
    valid: number;
    page_index: number;
    lightness: number;
    speed_ms: number;
    color: any;
    word_page: any;
    frames: FramesData;
    keyframes: any;
    "//": string;
}

export interface FramesData {
    valid?: number;
    frame_num?: number;
    frame_data: FrameData[];
}

export interface FrameData {
    frame_index: number;
    frame_RGB: string[];
}

export interface FileInfo {
    name: string;
    path: string;
}

export interface SelectedFile {
    fileInfo: FileInfo;
    config: LEDConfiguration;
    selectedLED: number; // 5, 6, or 7
}

export interface SlotFile {
    fileInfo: FileInfo;
    config: LEDConfiguration;
    sourceLED: number; // Which LED from the source file to use
}

export interface MergeMapping {
    slot: number;
    sourceFile?: string;
    sourceSlot?: number;
}

export type MergeStep =
    | "selectBase"
    | "configureMappings"
    | "review"
    | "complete";
