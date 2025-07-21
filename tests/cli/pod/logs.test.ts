import { afterAll, afterEach, beforeAll, describe, it, vi } from "vitest";

import { server } from "@mocks/msw";

vi.mock("@lib/ui", () => ({
  search: vi.fn().mockImplementation(({ choices }) => choices[0].name)
}));

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("logs command", () => {
  it("should fetch and tail logs for selected pod", async () => {

    // await logsCommand.handler({ raw: false });

    // expect(getOcToken).toHaveBeenCalledTimes(1);
    // expect(Openshift).toHaveBeenCalledWith(mockOCToken);
    // expect(promptForOcResource).toHaveBeenCalledTimes(2);
    // expect(promptForOcResource).toHaveBeenCalledWith(mockProjects);
    // expect(promptForOcResource).toHaveBeenCalledWith(mockDeployments);
    // expect(mockPods[0]?.followLogs).toHaveBeenCalledWith({ raw: false });
    // expect(mockPods[1]?.followLogs).toHaveBeenCalledWith({ raw: false });
  });

  // it("should tail raw logs when --raw flag is provided", async () => {
  //
  //   await logsCommand.handler({ raw: true });
  //
  //   // expect(mockPods[0].followLogs).toHaveBeenCalledWith({ raw: true });
  //   // expect(mockPods[1].followLogs).toHaveBeenCalledWith({ raw: true });
  // });
  //
  // it("should handle invalid user input for prompts", async () => {
  //   await expect(logsCommand.handler({ raw: false })).rejects.toThrow("Invalid selection");
  //   // expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining("Invalid selection"));
  // });
  //
  // it("should handle empty project list", async () => {
  //   await logsCommand.handler({ raw: false });
  //   // expect(promptForOcResource).toHaveBeenCalledWith([]);
  //   // expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining("No projects found"));
  // });
  //
  // it("should handle OpenShift API failure", async () => {
  //
  //   await expect(logsCommand.handler({ raw: false })).rejects.toThrow("Authentication failed");
  //   // expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining("Authentication failed"));
  // });
  //
  // it("should handle single pod scenario", async () => {
  //
  //   await logsCommand.handler({ raw: false });
  //   // expect(singlePod[0].followLogs).toHaveBeenCalledWith({ raw: false });
  //   // expect(singlePod[0].followLogs).toHaveBeenCalledTimes(1);
  // });
  //
  // it("should handle streaming logs termination", async () => {
  //
  //   await logsCommand.handler({ raw: false });
  //   // expect(mockFollowLogs).toHaveBeenCalledWith({ raw: false });
  // });
});
