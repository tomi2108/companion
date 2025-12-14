import { YamlFormatter, YamlMap } from "./formatters/yaml_formatter";
import { ObjectFile } from "./object_file";

export class YamlFile<T extends YamlMap = YamlMap> extends ObjectFile<T> {
  constructor(path: string, formatter?: YamlFormatter<T>) {
    super(path, formatter ?? new YamlFormatter<T>());
  }
}
