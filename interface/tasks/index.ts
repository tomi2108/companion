import fs from "node:fs";
import path from "node:path";

import { traverseDirectory } from "@files/utils";
import { Task } from "@interface/tasks/task";

type Opt = { project: string };
export const getTasksFromDir = async (dir: string, opt: Opt) => {
  const ignore = [".git", "dist", "coverage", ".husky", ".next", "node_modules", "out", "build"];
  const file_stats = traverseDirectory(dir, { flatten: true, ignore });
  const tasks: Task[] = [];
  for (const file_stat of file_stats) {
    tasks.push(...await getTasksFromFile(file_stat.path, opt));
  }
  return tasks;
};

export const getTasksFromFile = async (file_path: string, { project }: Opt) => {
  const content = fs.readFileSync(file_path).toString();
  const lines = content.split(/\r?\n/);
  const results: Task[] = [];
  for (let row = 0; row < lines.length; row++) {
    const line = lines[row];
    if (!line) continue;
    const regex = /TODO([^:]*):\s*(.*)/g;
    let match;
    while ((match = regex.exec(line)) !== null) {
      const col = match.index;
      const title = match[2]?.trim() ?? "";
      const splitted_path = file_path.split(path.sep);
      const saved_file_path = splitted_path.slice(splitted_path.findIndex((e) => e === project) + 1).join(path.sep);
      const file_location = { file_path: saved_file_path, row: row + 1, col: col + 1 };
      // TODO[https://gitlab-ee.agil.movistar.com.ar/movar_app/tools/companion/-/issues/36]: Task.description from file
      results.push(new Task({ title, project, file_location }));
    }
  }
  return results;
};

