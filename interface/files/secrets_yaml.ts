import yaml from "js-yaml";
import fs, { Dirent } from "node:fs";
import { z } from "zod/v4";

import { toYaml } from "@lib/utils";

const YamlContentSchema = z.record(z.string(), z.string());
type Content = z.infer<typeof YamlContentSchema>;

export class SecretsYaml {
  file_path: string;
  namespace?: string;
  content: Content;

  static isSecretsYaml(file: Dirent) {
    return file.isFile()
      && file.name.includes("values");
  }

  constructor(file_path: string) {
    const file_content = fs.readFileSync(file_path).toString();
    const yaml_content = (yaml.load(file_content) as { "externalSecret": any })?.externalSecret;
    if (!yaml_content) throw new InvalidSecretYaml(file_path);

    this.content = YamlContentSchema.parse(yaml_content);
    this.file_path = file_path;
  }

  toString() {
    return toYaml({ "externalSecret": this.content });
  }

  save() {
    const string = this.toString();
    fs.writeFileSync(this.file_path, string);
  }

  hasSecret(name: string) {
    return Object.values(this.content).includes(name);
  }

  private fillGaps() {
    const values = Object.values(this.content);
    this.content = Object.fromEntries(values.map((v, i) => [`secret${i + 1}`, v]));
  }

  addSecret(name: string) {
    const values = Object.values(this.content);
    if (values.includes(name)) return;
    const i = values.length;
    this.content[`secret${i + 1}`] = name;
    this.fillGaps();
  }
}

export class InvalidSecretYaml extends Error {
  constructor(full_path: string) {
    super(`${full_path} is not a valid secret yaml`);
  }
}
