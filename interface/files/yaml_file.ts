import yaml from "js-yaml";

import { InvalidYamlFile } from "./errors";
import { File } from "./file";

type YamlScalar =
  | string
  | number
  | boolean
  | null;

type YamlSequence = YamlValue[];

type YamlValue =
  | YamlScalar
  | YamlMap
  | YamlSequence;

interface YamlMap {
  [key: string]: YamlValue;
}

export class YamlFile<T extends YamlMap = YamlMap> extends File<T> {

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected validate(_content: unknown) { }

  read(): T {
    const content = super.readString();
    this.validate(content);
    try {
      return yaml.load(content) as T;
    } catch {
      throw new InvalidYamlFile(this.path);
    }
  }

  write(content: T) {
    const string = yaml.dump(content, {});
    super.writeString(string);
  }
}
