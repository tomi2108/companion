import { Dir } from "@files/dir";
import { TextFile } from "@files/text_file";
import { Task } from "@interface/tasks/task";

export const getTasksFromDir = (dir: Dir) => {
  const files = dir.traverse();
  const tasks: Task[] = [];
  for (const f of files) tasks.push(...getTasksFromFile(dir, f));
  return tasks;
};

export const getTasksFromFile = (project: Dir, fileInDir: TextFile) => {
  const lines = fileInDir.read().split(/\r?\n/);
  const results: Task[] = [];
  const regex = /TODO.*:\s*(.*)/g;
  for (let row = 0; row < lines.length; row++) {
    const line = lines[row]!;
    let match;
    while ((match = regex.exec(line)) !== null) {
      const col = match.index;
      const title = match[1]?.trim() ?? "";
      const file_location = { file: fileInDir, row: row + 1, col: col + 1 };
      // TODO[https://gitlab-ee.agil.movistar.com.ar/movar_app/tools/rishi/-/issues/36]: Task.description from file
      results.push(new Task({ title, project, file_location }));
    }
  }
  return results;
};

