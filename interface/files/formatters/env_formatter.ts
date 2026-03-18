import { FileFormatter } from ".";

export type EnvFileContent = Record<string, string | number | undefined>;

export class EnvFormatter extends FileFormatter<EnvFileContent> {

  toString(input: EnvFileContent): string {
    return Object.entries(input)
      .filter(([value]) => Boolean(value))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");
  }

  fromString(content: string): EnvFileContent {
    return Object.fromEntries(content
      .split("\n")
      .map((line) => line.split("="))
      .filter(([value]) => Boolean(value))
    );
  }

  exception(): Error | void { }

}
