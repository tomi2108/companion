import { File } from "./file";
import { StringFormatter } from "./formatters/string_formatter";

export class TextFile extends File<string> {

  constructor(path: string) {
    super(path, new StringFormatter());
  }

  insertLine(lineNo: number, line: string) {
    const lines = this.read().split("\n");
    lines.splice(lineNo - 1, 0, line);
    this.write(lines.join("\n"));
  }

  removeLine(lineNo: number) {
    const lines = this.read().split("\n");
    lines.splice(lineNo - 1, 1);
    this.write(lines.join("\n"));
  }
}
