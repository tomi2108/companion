import { promptForJiraIssue } from "@interface/prompts";
import { search } from "@lib/ui";

export default {
  command: "move",
  aliases: ["mv"],
  describe: "Change ticket status",
  handler: async () => {
    const issue = await promptForJiraIssue();
    const transitions = await issue.getAvailableTransitions();
    const choices = transitions.map(
      (t: { id: string; name: string; to: { name: string } }) => ({
        name: t.name,
        value: t.id,
        hint: `(${t.to.name})`
      }));
    const transition_id = await search({ message: "Choose transition", choices });
    await issue.transition(transition_id);
  }
};
