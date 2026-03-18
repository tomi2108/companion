import { File } from "@files/file";
import { TextFile } from "@files/text_file";
import { AppType } from "@lib/constants";

import { Dependency } from "../app_repo";
import { Capability } from "./capabilities";
import { Dir } from "../dir";
import { Connection } from "./connections/connection";
import { FILE_GROUPS } from "./project/file_groups";
import { ProjectLayout } from "./project/layout";

export interface FileMove {
  from: File<unknown>;
  to: File<unknown>;
}

export abstract class CreateApp {
  abstract readonly type: AppType;
  features: Capability[] = [];
  capabilities: Capability[] = [];
  connection?: Connection;
  connections?: Connection[];

  dependencies(): Dependency[] {
    return [...this.capabilities.flatMap((c) => c.dependencies())];
  }

  deletions(layout: ProjectLayout): (File<unknown> | Dir)[] {
    const appliedFiles = new Set(FILE_GROUPS
      .filter((group) => group.appliesTo(this))
      .flatMap((group) => group.files(layout))
      .map((f) => f.toString())
    );

    const nonAppliedFiles = FILE_GROUPS
      .filter((group) => !group.appliesTo(this))
      .flatMap((group) => group.files(layout));

    return nonAppliedFiles.filter((f) => !appliedFiles.has(f.toString()));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  moves(_layout: ProjectLayout): FileMove[] {
    return [];
  }

  envFiles(layout: ProjectLayout): TextFile[] {
    return [
      ...this.capabilities.flatMap((c) => c.envs(layout)),
      ...this.envs(layout)
    ];
  }

  abstract envs(layout: ProjectLayout): TextFile[];

  withConnection?(connection: Connection): CreateApp;
}
