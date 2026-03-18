import { ConfigRegistry } from "@lib/config/registry";
import { Command, ConfigHelp, ExecutionContext } from "@lib/index";
import { Table } from "@workflow/steps/ui/Table";

const ListCommand: Command = {
  name: "list",
  aliases: [],
  description: "List config help",
  run: () => {
    const ctx = ExecutionContext.get();
    const sections = ConfigRegistry.getSections();

    const helps = sections
      .flatMap(
        (s) => s.help?.()
          .map((h) => ({ ...h, section: s.key })
          )
      ).filter((c): c is ConfigHelp & { section: string } => Boolean(c));

    new Table({
      head: () => ["Section", "Key", "Type", "Description"],
      style: { compact: true },
      key: "helps",
      map: (h) => [h.section, h.key, h.type, h.description],
      step: { run: async () => ({ helps }) }
    }).run(ctx, {});
  }
};

export default ListCommand;
