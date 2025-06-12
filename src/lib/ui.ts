import { prompt } from "enquirer";

type ExtractFromPrompt<T> = Omit<Extract<Parameters<typeof prompt>[0], { type: T }>, "type" | "name">;

export type StringPromptOptions = ExtractFromPrompt<"input" | "invisible" | "list" | "password" | "text">;
export type ArrayPromptOptions<T = false> = ExtractFromPrompt<"autocomplete" | "editable" | "form" | "multiselect" | "select" | "survey" | "list" | "scale"> & { multiple?: T };
export type BooleanPromptOptions = ExtractFromPrompt<"confirm">;

export async function input(opts: StringPromptOptions) {
  const res = await prompt({ ...opts, type: "input", name: "selected" });
  return (res as { selected: string }).selected;
}

export async function password(opts: StringPromptOptions) {
  const res = await prompt({ ...opts, type: "password", name: "selected" });
  return (res as { selected: string }).selected;
}

export async function search<T>(opts: ArrayPromptOptions<T>) {
  // TODO: would be cool if search filtered hints as you type
  // I dont think this is doable with "enquirer" might have to move away from it
  // maybe look at Inquirer ??
  const res = await prompt({ ...opts, type: "autocomplete", scroll: true, separator: true, sort: true, name: "selected" });
  return (res as { selected: T extends true ? string[] : string }).selected;
}

export async function confirm(opts: Omit<BooleanPromptOptions, "format">) {
  const res = await prompt({ initial: true, ...opts, name: "selected", type: "confirm", format: (s) => s ? "yes" : "no" });
  return (res as { selected: boolean }).selected;
}

