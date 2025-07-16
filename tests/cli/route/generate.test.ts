import { beforeEach } from "node:test";
import { afterEach, describe, expect, it, vi } from "vitest";

import { clearMockConfig, mockConfig } from "@mocks/config";

import generateCommand from "@cli/route/generate";
import { ConfigError } from "@lib/config";

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  clearMockConfig();
});

describe("CLI - route generate command", () => {
  // it("generates frontend routes", async () => {
  //   mockSearch(
  //     async ({ choices }) => {
  //       if (choices.includes("secret")) return "secret";
  //       return typeof choices[0] === "string" ? choices[0] : choices[0]?.name ?? "";
  //     }
  //   );
  //   await generateCommand.handler();
  // });

  it("throws if openshift.mf_host_template is missing from config", async () => {
    mockConfig({ openshift: { mf_host_template: undefined } });
    await expect(generateCommand.handler()).rejects.toThrow(new ConfigError("openshift.mf_host_template"));
  });

  // it("prompts user to select a project", async () => {
  //   await generateCommand.handler();
  // });

  // it("prompts user to choose between frontend and backend", async () => {
  //   // Expect search prompt to ask for 'frontend' or 'backend'
  //   await generateCommand.handler();
  // });
  //
  // it("uses project.getDeployments() to retrieve deployments", async () => {
  //   // Verifies deployments are fetched before filtering
  //   await generateCommand.handler();
  // });
  //
  // it("filters deployments correctly for frontend", async () => {
  //   // Ensures only frontend deployments are considered
  //   await generateCommand.handler();
  // });
  //
  // it("builds correct route host and path for each deployment", async () => {
  //   // Ensures host uses correct env substitution and route follows /app/{name} format
  //   await generateCommand.handler();
  // });
  //
  // it("creates route with expected parameters for each frontend deployment", async () => {
  //   // Verifies route creation parameters match expected values
  //   await generateCommand.handler();
  // });
  //
  // it("logs a warning if a route already exists", async () => {
  //   // Simulate API returning 'AlreadyExists' error and check that warning is logged
  //   await generateCommand.handler();
  // });
  //
  // it("logs a success message when a route is created", async () => {
  //   // Expect log.info with proper message after creating route
  //   await generateCommand.handler();
  // });
  //
  // it("skips backend logic (TODO)", async () => {
  //   // Since backend routing is not implemented, confirm nothing happens for backend
  //   await generateCommand.handler();
  // });
});
