import { FileFormatter } from ".";

export type EnvContent = Record<string, string | number | undefined>;

export class EnvFormatter implements FileFormatter<EnvContent> {

  toString(input: EnvContent): string {
    return Object.entries(input)
      .filter(([value]) => Boolean(value))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");
  }

  fromString(content: string): EnvContent {
    return Object.fromEntries(content
      .split("\n")
      .map((line) => line.split("="))
      .filter(([value]) => Boolean(value))
    );
  }

  exception(): Error | void { }

}
