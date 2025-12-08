import fs from "node:fs";
import path from "node:path";

import { Task } from "@interface/tasks/task";
import { sleep } from "@lib/utils";

export const getTasksFromFile = (project: string) => (file_path: string) => {
  const content = fs.readFileSync(file_path).toString();
  const lines = content.split(/\r?\n/);
  const results: Task[] = [];

  lines.forEach((line, row) => {
    const regex = /TODO:\s*(.*)/g;
    let match;

    while ((match = regex.exec(line)) !== null) {
      const col = match.index;
      const title = match[1]?.trim() ?? "";
      const splitted_path = file_path.split(path.sep);
      const saved_file_path = splitted_path.slice(splitted_path.findIndex((e) => e === project) + 1).join(path.sep);
      const file_location = { file_path: saved_file_path, row: row + 1, col: col + 1 };
      results.push(
        new Task({
          title,
          project,
          tags: {
            priority: 1,
            status: "OPEN",
            file_location
          }
        }));
      sleep(1 * 1000);
    }
  });
  return results;
};

