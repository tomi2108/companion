import open from "open";
import openEditor from "open-editor";

import { File } from "@files/file";
import { Dir } from "@interface/dirs/dir";

import { Config } from "./config";

export async function openInBrowser(url: string) {
  const browser = Config.getView().get("preferences.browser");
  if (browser) open(url, { app: { name: browser } });
  else open(url);
}

export async function openInEditor(
  file: File<unknown> | Dir,
  opts: { wait?: boolean; line?: number; column?: number } = {}
) {
  await openEditor([{
    file: file.path,
    line: opts?.line,
    column: opts?.column
  }], { wait: opts?.wait, editor: Config.getView().get("preferences.editor") }
  );
}
