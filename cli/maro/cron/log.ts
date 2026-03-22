import { Command } from "@lib/index";
import { PromptOcProject } from "@workflow/steps/oc/projects/PromptOcProject";
import { PromptOcServer } from "@workflow/steps/oc/servers/PromptOcServer";

const LogCommand: Command = {
  name: "log",
  aliases: [],
  description: "Show the logs for the last run (job pod) of a selected OpenShift CronJob in a namespace.",
  run: async ({ ctx }) => {

    const { server } = await new PromptOcServer().run(ctx);
    const { project } = await new PromptOcProject().run(ctx, { server });

    const cronJobs = await project.getCronJobs();

    if (!cronJobs.length) {
      ctx.logger.warning(`No CronJobs found in namespace '${project.name}'.`);
      return;
    }

    const cron = await ctx.ui.promptChoice(cronJobs, { message: "Select CronJob" });
    const logs = await cron.getLastLog();

    if (!logs) {
      ctx.logger.warning?.("No logs found for the last run of this CronJob.");
      return;
    }

    ctx.logger.info(logs);
  }
};

export default LogCommand;
