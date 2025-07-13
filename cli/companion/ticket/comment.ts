import { promptForJiraIssue } from "@interface/prompts";
import { input } from "@lib/ui";

export default {
  command: "comment",
  describe: "Add comment to ticket",
  handler: async () => {
    const issue = await promptForJiraIssue();
    const comments = await issue.getComments();
    console.log(comments.map((c: { author: { displayName: string }; body: string }) =>
      `[${c.author.displayName}]: ${c.body}`
    ).join("\n"));
    const comment = await input({ message: "Comment:" });
    issue.comment(comment);
  }
};
