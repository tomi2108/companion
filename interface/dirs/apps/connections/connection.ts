import { TextFile } from "@files/text_file";
import { Dependency } from "@interface/dirs/app_repo";
import { Choice } from "@lib/constants";

import { FileMove } from "..";
import { ProjectLayout } from "../project/layout";

export abstract class Connection {
  abstract key: string;
  abstract dependencies(): Dependency[];
  abstract moves(layout: ProjectLayout): FileMove[];
  abstract envs(layout: ProjectLayout): TextFile[];

  toString() {
    return this.key;
  }
  toChoice(): Choice {
    return { name: this.toString() };
  }
}

