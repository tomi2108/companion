import { prompt } from "enquirer";

type ExtractFromPrompt<T> = Omit<Extract<Parameters<typeof prompt>[0], { type: T }>, "type" | "name">;

export type StringPromptOptions = ExtractFromPrompt<"input" | "invisible" | "list" | "password" | "text">;
export type ArrayPromptOptions = ExtractFromPrompt<"autocomplete" | "editable" | "form" | "multiselect" | "select" | "survey" | "list" | "scale">;
export type BooleanPromptOptions = ExtractFromPrompt<"confirm">;

export async function input(opts: StringPromptOptions) {
  return await prompt({ ...opts, type: "input", name: "" });
}

export async function password(opts: StringPromptOptions) {
  return await prompt({ ...opts, type: "password", name: "" });
}

export async function search(opts: ArrayPromptOptions) {
  return await prompt({ ...opts, type: "autocomplete", name: "" });
}

export async function confirm(opts: Omit<BooleanPromptOptions, "format">) {
  // TODO: test
  return await prompt({ initial: true, ...opts, name: "", type: "confirm", format: (s) => s ? "yes" : "no" });
}

