import { Choice } from "@lib/constants";
import { Spinner } from "@topcli/spinner";

import {
  ArrayPromptOptions,
  BooleanPromptOptions,
  MultiProgressBar,
  ProgressBar,
  PromptChoiceOptions,
  Spinner as SpinnerType,
  StringPromptOptions,
  UI
} from ".";

export class ReactUi implements UI {

  confirm(opts: Omit<BooleanPromptOptions, "format">): Promise<boolean> {
    console.log("confirm");
    return "";
  }

  search<K, R = K extends true ? string[] : string>(opts: ArrayPromptOptions<K>): Promise<R> {
    console.log("search");
    return "";
  }

  promptChoice<T extends { toChoice: () => Choice },
    Multiple,
    Optional,
    R = Multiple extends true ? T[] : Optional extends true ? T | null : T
  >(
    resources: T[],
    opts?: PromptChoiceOptions<Multiple, Optional>
  ): Promise<R> {
    console.log("promptChoice");
    return "";
  }

  async input(opts: StringPromptOptions): Promise<string> {
    console.log("input");
    return "";
  }

  password(opts: StringPromptOptions): Promise<string> {
    console.log("password");
    return "";
  }

  progressBar(total?: number, prefix?: string): ProgressBar {
    console.log("progressBar");
    return "";

  }

  multiProgressBar(): MultiProgressBar {
    console.log("multiProgressBar");
    return "";
  }

  confirmAndSearch<T extends { toChoice: () => Choice },
    Multiple,
    Optional,
    R = Multiple extends true ? T[] : Optional extends true ? T | null : T
  >(
    resources: T[],
    confirmOpts: Omit<BooleanPromptOptions, "format">,
    searchOpts: PromptChoiceOptions<Multiple, Optional>
  ): Promise<R | null> {
    console.log("confirmAndSearch");
    return "";
  }

  loading(startText: string): SpinnerType {
    console.log("loading");
    const spinner = new Spinner().start(startText);
    const succeed = (text?: string) => spinner.succeed(text);
    const fail = (text?: string) => spinner.failed(text);
    const text = (text?: string) => spinner.text = text;
    const elapsedTime = () => `${spinner.elapsedTime.toFixed(2)} ms`;
    return { succeed, fail, text, elapsedTime };
  }

}
