import { FileFormatter } from ".";

export class StringFormatter implements FileFormatter<string> {
  toString(input: string) {
    return input;
  }

  fromString(content: string): string {
    return content;
  }

  exception() { }
}
