import { FileFormatter } from "@files/formatters";
import { StringFormatter } from "@files/formatters/string_formatter";
import { TempFile } from "@files/temp_file";

import { WorkflowOptions, WorkflowStep } from "..";

type Reads = {};
type Writes<F> = {
  changed: boolean;
  file?: F;
};
type Options<F> = {
  content: string;
  formatter?: FileFormatter<F>;
};

export class PromptTempFile<F = string> extends WorkflowStep<Reads, Writes<F>> {

  constructor(override options: WorkflowOptions<Options<F>, Writes<F>>) {
    super(options);
  }

  async run() {
    const content = this.options.content;
    const formatter = this.options.formatter ?? new StringFormatter();
    const { changed, new_content } = await new TempFile({ content }).prompt();
    if (!changed) return { changed: false };
    return { changed: true, file: formatter?.fromString(new_content) as F };
  }
}
