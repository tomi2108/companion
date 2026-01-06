import { MultiBar as MultiProgressBar, Presets, SingleBar } from "cli-progress";
import { prompt } from "enquirer";

import { Choice } from "@lib/constants";
import { mapToChoice } from "@lib/utils";
import { Spinner } from "@topcli/spinner";

import { ArrayPromptOptions, BooleanPromptOptions, ProgressBar, PromptChoiceOptions, StringPromptOptions } from ".";

export class DefaultUI {

  async input(opts: StringPromptOptions) {
    const res = await prompt({ ...opts, type: "input", name: "selected" });
    return (res as { selected: string }).selected;
  }

  async password(opts: StringPromptOptions) {
    const res = await prompt({ ...opts, type: "password", name: "selected" });
    return (res as { selected: string }).selected;
  }

  async search<K, R = K extends true ? string[] : string>(opts: ArrayPromptOptions<K>) {
    // TODO[https://gitlab-ee.agil.movistar.com.ar/movar_app/tools/rishi/-/issues/34]: would be cool if search filtered hints as you type
    // I dont think this is doable with "enquirer" might have to move away from it
    // maybe look at Inquirer ??
    const res = await prompt({ ...opts, type: "autocomplete", scroll: true, separator: true, sort: true, name: "selected" });
    return (res as { selected: R }).selected;
  }

  async promptChoice<T extends {
    toChoice: () => Choice;
  }, K, R = K extends true ? T[] : T>(
    resources: T[],
    promptOpts?: PromptChoiceOptions<K>
  ) {
    const opts = promptOpts || {};
    const resource = await this.search({
      choices: resources.map(mapToChoice),
      message: "",
      ...opts
    });
    if (Array.isArray(resource)) return resource.map((r1) => resources.find((r) => r.toChoice().name === r1)) as R;
    return resources.find((r) => r.toChoice().name === resource) as R;
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
      format: "{prefix}{prefixPadding}[{bar}] {percentage}% | {value}/{total} | {sufix}",
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
    const setSufix = (sufix: string) => bar.increment(0, { sufix });

    const setTotal = (to: number) => {
      if (!total && !bar.isActive) bar.start(to, 0);
      bar.setTotal(to);
    };
    setPrefix(prefix ?? "");

    return { update, increment, stop, setTotal, setSufix, setPrefix };
  }

  multiProgressBar() {
    const multi = new MultiProgressBar({
      format: "{prefix}{prefixPadding}[{bar}] {percentage}% | {value}/{total} | {sufix}",
      forceRedraw: true,
      gracefulExit: true,
      autopadding: true,
      stopOnComplete: true,
      barCompleteChar: "#"
    }, Presets.legacy);

    const create = (total?: number, prefix?: string): ProgressBar => {
      const bar = multi.create(total ?? 0, 0, { prefix: "", sufix: "" }) as SingleBar & { setPrefix: (i: string) => void; setSufix: (i: string) => void };
      bar.setPrefix = (prefix: string) => bar.increment(0, { prefix, prefixPadding: " ".repeat(Math.max(12 - prefix.length, 0)) });
      bar.setSufix = (sufix: string) => bar.increment(0, { sufix });
      if (prefix) bar.setPrefix(prefix);
      return bar;
    };

    const stop = () => multi.stop();

    return { create, stop };
  }
}
