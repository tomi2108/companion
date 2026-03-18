import { MultiBar as MultiProgressBar, Presets, SingleBar } from "cli-progress";
import { prompt } from "enquirer";

import { Choice } from "@lib/constants";
import { mapToChoice } from "@lib/utils";
import { Spinner } from "@topcli/spinner";

import { ArrayPromptOptions, BooleanPromptOptions, ProgressBar, PromptChoiceOptions, StringPromptOptions, UI } from ".";

export class DefaultUI implements UI {

  async input(opts: StringPromptOptions) {
    const res = await prompt({ ...opts, type: "input", name: "selected" });
    return (res as { selected: string }).selected;
  }

  async password(opts: StringPromptOptions) {
    const res = await prompt({ ...opts, type: "password", name: "selected" });
    return (res as { selected: string }).selected;
  }

  async search<K, R = K extends true ? string[] : string>(opts: ArrayPromptOptions<K>) {
    // TODO(20260318-002421): would be cool if search filtered hints as you type
    // I dont think this is doable with "enquirer" might have to move away from it
    // maybe look at Inquirer ??
    const res = await prompt({
      ...opts,
      type: "autocomplete",
      scroll: true,
      // @ts-expect-error this works, enquirer types are wrong
      limit: Math.min(15, process.stdout.rows - 4),
      sort: true,
      name: "selected"
    });
    return (res as { selected: R }).selected;
  }

  async confirmAndSearch<T extends { toChoice: () => Choice },
    Multiple,
    Optional,
    R = Multiple extends true ? T[] : Optional extends true ? T | null : T
  >(
    resources: T[],
    confirmOpts: Omit<BooleanPromptOptions, "format">,
    searchOpts: PromptChoiceOptions<Multiple, Optional>): Promise<R | null> {
    const c = await this.confirm(confirmOpts);
    if (c) {
      const res = await this.promptChoice(resources, searchOpts);
      return res as R;
    }
    return null;
  }

  async promptChoice<T extends { toChoice: () => Choice },
    Multiple,
    Optional,
    R = Multiple extends true ? T[] : Optional extends true ? T | null : T
  >(resources: T[], promptOpts?: PromptChoiceOptions<Multiple, Optional>): Promise<R> {
    const opts = promptOpts || {};
    const mapped = resources.map(mapToChoice);

    const choices = promptOpts?.optional && !promptOpts.multiple
      ? [{ name: "None" }, ...mapped]
      : mapped;

    const resource = await this.search({
      choices,
      message: "",
      ...opts
    });
    if (Array.isArray(resource)) return resource.map((r1) => resources.find((r) => r.toChoice().name === r1)) as R;
    if (promptOpts?.optional && resource === "None") return null as R;
    return resources.find((r) => r.toChoice().value === resource || r.toChoice().name === resource) as R;
  }

  async confirm(opts: Omit<BooleanPromptOptions, "format">) {
    const res = await prompt({ initial: true, ...opts, name: "selected", type: "confirm", format: (s) => s ? "yes" : "no" });
    return (res as { selected: boolean }).selected;
  }

  loading(startText: string) {
    const spinner = new Spinner().start(startText);
    const succeed = (text?: string) => spinner.succeed(text);
    const fail = (text?: string) => spinner.failed(text);
    const text = (text?: string) => spinner.text = text;
    const elapsedTime = () => `${spinner.elapsedTime.toFixed(2)} ms`;

    return { succeed, fail, text, elapsedTime };
  }

  progressBar(total?: number, prefix?: string) {
    const bar = new SingleBar({
      format: "{prefix}{prefixPadding}[{bar}] {percentage}% | {value}/{total} | {suffix}",
      autopadding: true,
      forceRedraw: true,
      gracefulExit: true,
      stopOnComplete: true,
      barCompleteChar: "#"
    }, Presets.legacy);

    const update = (to: number) => bar.update(to);
    const increment = (by: number) => bar.increment(by);
    const stop = () => bar.stop();
    const setPrefix = (prefix: string) => bar.increment(0, { prefix, prefixPadding: " ".repeat(Math.max(12 - prefix.length, 0)) });
    const setSuffix = (suffix: string) => bar.increment(0, { suffix });

    const setTotal = (to: number) => {
      if (!total && !bar.isActive) bar.start(to, 0);
      bar.setTotal(to);
    };

    const addToTotal = (n: number) => {
      if (!total && !bar.isActive) bar.start(0, 0);
      bar.setTotal(bar.getTotal() + n);
    };

    setPrefix(prefix ?? "");

    return { update, increment, stop, setTotal, setSuffix, setPrefix, addToTotal };
  }

  multiProgressBar() {
    const multi = new MultiProgressBar({
      format: "{prefix}{prefixPadding}[{bar}] {percentage}% | {value}/{total} | {suffix}",
      forceRedraw: true,
      gracefulExit: true,
      autopadding: true,
      stopOnComplete: true,
      barCompleteChar: "#"
    }, Presets.legacy);

    const create = (total?: number, prefix?: string): ProgressBar => {
      const bar = multi.create(total ?? 0, 0, { prefix: "", suffix: "" }) as SingleBar & {
        setPrefix: (prefix: string) => void;
        setSuffix: (suffix: string) => void;
        addToTotal: (n: number) => void;
      };
      bar.setPrefix = (prefix: string) => bar.increment(0, { prefix, prefixPadding: " ".repeat(Math.max(12 - prefix.length, 0)) });
      bar.setSuffix = (suffix: string) => bar.increment(0, { suffix });
      bar.addToTotal = (n: number) => bar.setTotal(bar.getTotal() + n);
      if (prefix) bar.setPrefix(prefix);
      return bar;
    };

    const stop = () => multi.stop();

    return { create, stop };
  }
}