import { Choice } from "@lib/constants";
import { ArrayPromptOptions, search } from "@lib/ui";
import { mapToChoice } from "@lib/utils";

type PromptOptions<T> = Omit<ArrayPromptOptions<T>, "choices">;

export async function promptChoice<T extends {
  name: string;
  toChoice: () => Choice;
}, K, R = K extends true ? T[] : T>(resources: T[], promptOpts?: PromptOptions<K>): Promise<R> {
  const opts = promptOpts || {};
  const resource = await search({
    choices: resources.map(mapToChoice),
    message: "",
    ...opts
  });
  if (!resource) return process.exit(1);
  if (Array.isArray(resource)) return resource.map((r1) => resources.find((r) => r.name === r1)) as R;
  return resources.find((r) => r.name === resource) as R;
}
