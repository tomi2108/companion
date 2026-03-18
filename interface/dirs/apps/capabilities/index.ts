import { TextFile } from "@files/text_file";
import { Dependency } from "@interface/dirs/app_repo";

import { ProjectLayout } from "../project/layout";

export interface Capability {
  dependencies(): Dependency[];
  envs(layout: ProjectLayout): TextFile[];
  toString(): string;
}
