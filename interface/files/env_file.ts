import { EnvFileContent, EnvFormatter } from "./formatters/env_formatter";
import { ObjectFile } from "./object_file";

export class EnvFile extends ObjectFile<EnvFileContent> {

  constructor(path: string) {
    super(path, new EnvFormatter());
  }

  override writePartial(partial: { [x: string]: string | number | undefined }): void {
    if (!this.exists()) this.write({});
    super.writePartial(partial);
  }

  add(key: string, value: string | number) {
    this.writePartial({ [key]: value });
  }

  remove(key: string) {
    const content = this.read();
    if (!(key in content)) return;
    this.writePartial({ [key]: undefined });
  }

}
