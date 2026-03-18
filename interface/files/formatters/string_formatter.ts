import { FileFormatter } from ".";

export class StringFormatter extends FileFormatter<string> {
  toString(input: string) {
    return input;
  }

  fromString(content: string): string {
    return content;
  }

  exception() { }
}
