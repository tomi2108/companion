import { prompt } from "enquirer";

import { Choice } from "@lib/constants";
type ExtractFromPrompt<T> = Omit<Extract<Parameters<typeof prompt>[0], { type: T }>, "type" | "name">;

export type StringPromptOptions = ExtractFromPrompt<"input" | "invisible" | "list" | "password" | "text">;
export type ArrayPromptOptions<T = false> = ExtractFromPrompt<"autocomplete" | "editable" | "form" | "multiselect" | "select" | "survey" | "list" | "scale"> & { multiple?: T };
export type BooleanPromptOptions = ExtractFromPrompt<"confirm">;
export type PromptChoiceOptions<K> = Omit<ArrayPromptOptions<K>, "choices">;

export type Spinner = {
  succeed: (text?: string) => void;
  fail: (text?: string) => void;
};
// TODO: Type this
export type ProgressBar = {};
export type MultiProgressBar = {};

export interface UI {
  input(opts: StringPromptOptions): Promise<string>;
  password(opts: StringPromptOptions): Promise<string>;
  confirm(opts: Omit<BooleanPromptOptions, "format">): Promise<boolean>;
  promptChoice<T extends { toChoice: () => Choice }, K, R = K extends true ? T[] : T>(
    resources: T[],
    opts?: PromptChoiceOptions<K>
  ): Promise<R>;
  loading(startText: string): Spinner;
  progressBar(total?: number, prefix?: string): ProgressBar;
  multiProgressBar(): MultiProgressBar;
}
