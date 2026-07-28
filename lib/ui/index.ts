import { prompt } from "enquirer";

import { Choice } from "@lib/constants";
type ExtractFromPrompt<T> = Omit<Extract<Parameters<typeof prompt>[0], { type: T }>, "type" | "name">;

export type StringPromptOptions = ExtractFromPrompt<"input" | "invisible" | "list" | "password" | "text">;
export type ArrayPromptOptions<T = false, K = false> = ExtractFromPrompt<"autocomplete" | "editable" | "form" | "multiselect" | "select" | "survey" | "list" | "scale"> & { multiple?: T; optional?: K; limit?: number };
export type BooleanPromptOptions = ExtractFromPrompt<"confirm">;
export type PromptChoiceOptions<T = false, K = false> = Omit<ArrayPromptOptions<T, K>, "choices">;

export type Spinner = {
  succeed: (text?: string) => void;
  fail: (text?: string) => void;
  text?: (text?: string) => void;
  elapsedTime: () => string;
};

export type ProgressBar = {
  setSuffix(suffix: string): void;
  setPrefix(prefix: string): void;
  setTotal(total: number): void;
  addToTotal(n: number): void;
  increment(by: number): void;
  stop(): void;
};

export type MultiProgressBar = {
  create(total: number, label: string): ProgressBar;
};

export interface UI {
  input(opts: StringPromptOptions): Promise<string>;
  password(opts: StringPromptOptions): Promise<string>;
  confirm(opts: Omit<BooleanPromptOptions, "format">): Promise<boolean>;
  confirmAndSearch<T extends { toChoice: () => Choice },
    Multiple,
    Optional,
    R = Multiple extends true ? T[] : Optional extends true ? T | null : T
  >(
    resources: T[],
    confirmOpts: Omit<BooleanPromptOptions, "format">,
    searchOpts: PromptChoiceOptions<Multiple, Optional>): Promise<R | null>;
  search<K, R = K extends true ? string[] : string>(opts: ArrayPromptOptions<K>): Promise<R>;
  promptChoice<T extends { toChoice: () => Choice }, Multiple, Optional, R = Multiple extends true ? T[] : Optional extends true ? T | null : T>(
    resources: T[],
    opts?: PromptChoiceOptions<Multiple, Optional>
  ): Promise<R>;
  loading(startText: string): Spinner;
  progressBar(total?: number, prefix?: string): ProgressBar;
  multiProgressBar(): MultiProgressBar;
}
