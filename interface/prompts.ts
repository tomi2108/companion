import { Dir } from "@files/dir";
import { Jira } from "@jira";
import { Config } from "@lib/config";
import { Choice } from "@lib/constants";
import { ArrayPromptOptions, search } from "@lib/ui";

type PromptOptions<T> = Omit<ArrayPromptOptions<T>, "choices">;

export async function promptForOcResource<T extends {
  name: string;
  toChoice: () => Choice;
}, K, R = K extends true ? T[] : T>(resources: T[], promptOpts?: PromptOptions<K>): Promise<R> {
  const opts = promptOpts || {};
  const resource = await search({
    choices: resources.map((r) => r.toChoice()),
    message: "",
    ...opts
  });
  if (!resource) return process.exit(1);
  if (Array.isArray(resource)) return resource.map((r1) => resources.find((r) => r.name === r1)) as R;
  return resources.find((r) => r.name === resource) as R;
}

export async function promptForJiraIssue<T>(
  promptOpts?: PromptOptions<T>,
  issueOpts?: { type?: string; labels?: string[] }
) {
  const pOpts = promptOpts || {};
  const iOpts = issueOpts || {};
  const jira = new Jira();

  const issues = await jira.getIssues({
    labels: Config.get().jira.labels ?? [],
    status: ["Finalizado", "En curso"], ...iOpts
  });

  const choices = issues.map((i) => i.toChoice());
  const choice = await search({ choices, message: "Select an issue:", ...pOpts });

  if (!choice) return process.exit(1);
  return issues.find((i) => i.key === choice)!;
}

export async function promptSourcesOrOne(options: { enabled: boolean; path: string | undefined }[]) {
  const sources = options
    .filter((o) => o.enabled)
    .map((o) => o.path)
    .filter((o) => o !== undefined);
  let dirs: Dir[] = sources.flatMap((p) => new Dir(p).readDirs());

  if (dirs.length === 0) {
    const fallbackSources = options.map((o) => o.path).filter(Boolean) as string[];
    if (fallbackSources.length === 0) return null;
    const choices = fallbackSources.flatMap((p) => new Dir(p).readDirs());
    const choice = await search({ choices: choices.map((p) => p.toChoice()), message: "Select project" });
    dirs = [choices.find((p) => p.toChoice().name === choice)!];
  }
  return dirs;
}
