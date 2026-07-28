import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockSearch } from "@mocks/ui";

import CloseCommand from "@cli/mr/close";

import { config } from "../mocks/config";
import { ctx } from "../mocks/ctx";

describe("CloseCommand", () => {
  beforeEach(() => {
    ctx.reset();
    vi.restoreAllMocks();
  });

  it("closes selected merge request", async () => {
    const mr = await ctx.gitProvider.mergeRequests.create();
    mockSearch(mr, { once: true });
    expect(CloseCommand.run).toBeDefined();

    await CloseCommand.run?.({ ctx, config, args: {} });

    expect(mr.close).toHaveBeenCalledTimes(1);
  });
});
