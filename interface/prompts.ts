import { Choice } from "@lib/constants";
import { ArrayPromptOptions, search } from "@lib/ui";
import { mapToChoice } from "@lib/utils";

type PromptOptions<T> = Omit<ArrayPromptOptions<T>, "choices">;

export async function promptChoice<T extends {
  toChoice: () => Choice;
}, K, R = K extends true ? T[] : T>(resources: T[], promptOpts?: PromptOptions<K>) {
  const opts = promptOpts || {};
  const resource = await search({
    choices: resources.map(mapToChoice),
    message: "",
    ...opts
  });
  if (Array.isArray(resource)) return resource.map((r1) => resources.find((r) => r.toChoice().name === r1)) as R;
  return resources.find((r) => r.toChoice().name === resource) as R;
}
