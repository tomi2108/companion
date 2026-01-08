import yaml from "js-yaml";

import { InvalidYamlFile } from "@files/errors";

import { FileFormatter } from ".";

type YamlScalar =
  | string
  | number
  | boolean
  | null
  | undefined;

type YamlSequence = YamlValue[];

type YamlValue =
  | YamlScalar
  | YamlMap
  | YamlSequence;

export interface YamlMap {
  [key: string]: YamlValue;
}

export class YamlFormatter<T extends YamlMap = YamlMap> implements FileFormatter<T> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected validate(_content: unknown) { }

  fromString(content: string): T {
    const obj = yaml.load(content) as T;
    this.validate(obj);
    return obj;
  }

  exception(path: string): Error | void {
    return new InvalidYamlFile(path);
  }

  toString(input: T): string {
    return yaml.dump(input, {});
  }
}
