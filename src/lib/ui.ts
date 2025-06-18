import { Spinner } from "@topcli/spinner";
import { prompt } from "enquirer";
import cliProgress, { SingleBar } from "cli-progress";

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

export function spinner(startText: string) {
  const spinner = new Spinner().start(startText);
  const succeed = (text?: string) => spinner.succeed(text);
  const fail = (text?: string) => spinner.failed(text);
  const text = (text?: string) => spinner.text = text;
  const elapsedTime = () => `${spinner.elapsedTime.toFixed(2)} ms`;

  return { succeed, fail, text, elapsedTime };
}

export function progressBar(total?: number, start?: number, prefix?: string) {
  const bar = new cliProgress.SingleBar({
    format: `${prefix} [{bar}] {percentage}% | {value}/{total}`,
    autopadding: true,
    barCompleteChar: "#"
  }, cliProgress.Presets.legacy);

  if (total) bar.start(total, start ?? 0);

  const update = (to: number) => bar.update(to);
  const increment = (by: number) => bar.increment(by);
  const stop = () => bar.stop();

  const setTotal = (to: number) => {
    if (!total && !bar.isActive) bar.start(to, 0);
    bar.setTotal(to);
  };

  return { update, increment, stop, setTotal };
}

export type ProgressBar = SingleBar & { setPrefix: (s: string) => void; setSufix: (s: string) => void };

export function multiProgressBar() {
  const multi = new cliProgress.MultiBar({
    format: "{prefix}{prefixPadding}[{bar}] {percentage}% | {value}/{total} | {sufix}",
    autopadding: true,
    barCompleteChar: "#"
  }, cliProgress.Presets.legacy);

  const create = (total?: number, start?: number) => {
    const bar = multi.create(total ?? 0, start ?? 0, { prefix: "", sufix: "" }) as ProgressBar;
    bar.setPrefix = (prefix: string) => bar.increment(0, { prefix, prefixPadding: " ".repeat(12 - prefix.length) });
    bar.setSufix = (sufix: string) => bar.increment(0, { sufix });
    return bar;
  };

  const stop = () => multi.stop();

  return { create, stop };
}
