import fs, { Dirent } from "node:fs";
import yaml from "js-yaml";

export class SecretsYaml {
  file_path: string;
  namespace?: string;
  // TODO: type content
  content: any;

  static isSecretsYaml(file: Dirent) {
    return file.isFile();
    // && ENVS.some((e) => file.name.includes(e));
    // && file.name.includes("values-");
    // TODO: probably look for "externalSecret"
    // && fs.readFileSync(file.);
  }

  constructor(file_path: string) {
    const file_content = fs.readFileSync(file_path).toString();
    const yaml_content = (yaml.load(file_content) as { "externalSecret": any })?.externalSecret;
    if (!yaml_content) throw new InvalidSecretYaml(file_path);

    this.content = yaml_content;
    this.file_path = file_path;
  }

  toString() {
    return yaml.dump({ "externalSecret": this.content });
  }

  save() {
    const string = this.toString();
    fs.writeFileSync(this.file_path, string);
  }

  hasSecret(name: string) {
    return Object.values(this.content).includes(name);
  }

  addSecret(name: string) {
    // TODO: probably check keys have no gaps (eg: secret3 is defined but secret2 is not)
    // and adjust everything if they have
    const values = Object.values(this.content);
    if (values.includes(name)) return;
    const i = values.length;
    this.content[`secret${i + 1}`] = name;
  }
}

export class InvalidSecretYaml extends Error {
  constructor(full_path: string) {
    super(`${full_path} is not a valid secret yaml`);
  }
}
