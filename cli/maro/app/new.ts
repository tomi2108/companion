import { APP_TYPES, AppType } from "@lib/constants";
import { Command } from "@lib/index";
import { AppNew } from "@workflow/steps/app/AppNew";
import { ValidateConfig } from "@workflow/steps/config/ValidateConfig";
import { If } from "@workflow/steps/flow/If";
import { Input } from "@workflow/steps/ui/Input";
import { Search } from "@workflow/steps/ui/Search";
import { Workflow } from "@workflow/workflow";

const NewCommand: Command = {
  name: "new",
  aliases: ["n"],
  description: "Create a new app from template",
  run: async ({ ctx }) => {
    await new Workflow([
      new ValidateConfig({
        keys: [
          "gitlab.repos.despliegues",
          "paths.despliegues",
          "paths.argocd"
        ]
      }),
      new Search({
        transform: ({ choice }) => ({ app_type: choice }),
        choices: APP_TYPES,
        message: "Choose app type"
      }),
      new Input({ message: "Enter name", write: "name" }),
      new Input({ message: "Enter description", write: "description" }),
      new If({
        condition: ({ app_type }: { app_type: AppType }) => app_type === "app",
        then: new Workflow([
          new ValidateConfig({ keys: ["paths.frontend", "gitlab.repos.frontend"] }),
          AppNew.frontend()
        ]),
        else: new Workflow([
          new ValidateConfig({ keys: ["paths.backend", "gitlab.repos.backend"] }),
          AppNew.backend()
        ])
      })
    ]).run(ctx);
    // TODO(20260318-002442): When waiting for pipelines works
  }
};

export default NewCommand;