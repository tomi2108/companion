import axios from "axios";

import { JsonFormatter } from "@files/formatters/json_formatter";
import { StringFormatter } from "@files/formatters/string_formatter";
import { Command } from "@lib/index";
import { PromptOcProject } from "@workflow/steps/oc/projects/PromptOcProject";
import { PromptOcServer } from "@workflow/steps/oc/servers/PromptOcServer";

const TestRouteCommand: Command = {
  name: "test",
  description: "Test if routes are healthy and correctly expose services, issuing simulated requests and checking responses.",
  async run({ ctx }) {
    const { server } = await new PromptOcServer().run(ctx);
    const { project } = await new PromptOcProject().run(ctx, { server });
    const routes = await project.getRoutes();

    if (!routes.length) {
      ctx.logger.warning(`No routes found in namespace '${project.name}'.`);
      return;
    }
    const route = await ctx.ui.promptChoice(routes, { message: "Choose route" });

    const protocol = route.tlsTermination ? "https" : "http";
    const url = `${protocol}://${route.host}${route.path ?? ""}`;
    const res = await axios.get(url, { timeout: 5000, validateStatus: () => true });
    const formatter = typeof res.data === "string" ? new StringFormatter() : new JsonFormatter();
    const output = `(${res.status}) ${formatter.toString(res.data)}`;
    if (res.status >= 200 && res.status < 300) ctx.logger.success(output);
    else ctx.logger.error(output);
  }
};

export default TestRouteCommand;
