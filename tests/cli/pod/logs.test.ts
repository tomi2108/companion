import { search } from "@lib/ui";
import { server } from "@mocks/msw";
import { mockDeployments } from "@mocks/oc/deployments";
import { mockProjects } from "@mocks/oc/projects";
import { stdin } from "mock-stdin";
import { describe, it, beforeEach, afterEach, vi, beforeAll, afterAll } from "vitest";

vi.mock("../../../lib/ui");

vi.mocked(search).mockResolvedValueOnce(mockProjects[0].metadata.name);
vi.mocked(search).mockResolvedValueOnce(mockDeployments[0].metadata.name);

beforeAll(() => server.listen());
afterAll(() => server.close());

let mockStdin: ReturnType<typeof stdin>;

beforeEach(() => {
  mockStdin = stdin();
  vi.clearAllMocks();
});

afterEach(() => {
  mockStdin.restore();
});

// async function runCommand(...args: Parameters<(typeof logsCommand)["handler"]>) {
//   await logsCommand.handler(...args);
// }
//
// const mockToken = "fake-token";

describe("logs command", () => {
  it("", () => { });
  // it("should fetch and tail logs for selected pod", async () => {
  //   const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => { });
  //
  //   setTimeout(() => {
  //     mockStdin.send("0\n");
  //     mockStdin.send("0\n");
  //   }, 10);
  //
  //   await runCommand({ raw: false });
  //
  //   expect(getOcToken).toHaveBeenCalledTimes(1);
  //   expect(Openshift).toHaveBeenCalledWith(mockToken);
  //   expect(promptForOcResource).toHaveBeenCalledTimes(2);
  //   expect(promptForOcResource).toHaveBeenCalledWith(mockProjects);
  //   expect(promptForOcResource).toHaveBeenCalledWith(mockDeployments);
  //   // expect(mockPods[0]?.followLogs).toHaveBeenCalledWith({ raw: false });
  //   // expect(mockPods[1]?.followLogs).toHaveBeenCalledWith({ raw: false });
  //   consoleSpy.mockRestore();
  // });
  //
  // it("should tail raw logs when --raw flag is provided", async () => {
  //   const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => { });
  //
  //   setTimeout(() => {
  //     mockStdin.send("0\n");
  //     mockStdin.send("0\n");
  //   }, 10);
  //
  //   await runCommand({ raw: true });
  //
  //   // expect(mockPods[0].followLogs).toHaveBeenCalledWith({ raw: true });
  //   // expect(mockPods[1].followLogs).toHaveBeenCalledWith({ raw: true });
  //   consoleSpy.mockRestore();
  // });
  //
  // it("should handle invalid user input for prompts", async () => {
  //   const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => { });
  //
  //   setTimeout(() => {
  //     mockStdin.send("invalid\n");
  //   }, 10);
  //
  //   await expect(runCommand({ raw: false })).rejects.toThrow("Invalid selection");
  //   expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining("Invalid selection"));
  //   consoleErrorSpy.mockRestore();
  // });
  //
  // it("should handle empty project list", async () => {
  //   const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => { });
  //
  //   await runCommand({ raw: false });
  //   expect(promptForOcResource).toHaveBeenCalledWith([]);
  //   expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining("No projects found"));
  //   consoleErrorSpy.mockRestore();
  // });
  //
  // it("should handle OpenShift API failure", async () => {
  //   const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => { });
  //
  //   await expect(runCommand({ raw: false })).rejects.toThrow("Authentication failed");
  //   expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining("Authentication failed"));
  //   consoleErrorSpy.mockRestore();
  // });
  //
  // it("should handle single pod scenario", async () => {
  //   const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => { });
  //   const singlePod = [{ name: "pod1", followLogs: vi.fn().mockResolvedValue(undefined) }] as const;
  //
  //   setTimeout(() => {
  //     mockStdin.send("0\n");
  //     mockStdin.send("0\n");
  //   }, 10);
  //
  //   await runCommand({ raw: false });
  //   expect(singlePod[0].followLogs).toHaveBeenCalledWith({ raw: false });
  //   expect(singlePod[0].followLogs).toHaveBeenCalledTimes(1);
  //   consoleSpy.mockRestore();
  // });
  //
  // it("should handle streaming logs termination", async () => {
  //   const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => { });
  //   const mockFollowLogs = vi.fn().mockImplementation(() => {
  //     return new Promise((resolve) => setTimeout(resolve, 100));
  //   });
  //
  //   setTimeout(() => {
  //     mockStdin.send("0\n");
  //     mockStdin.send("0\n");
  //   }, 10);
  //
  //   await runCommand({ raw: false });
  //   expect(mockFollowLogs).toHaveBeenCalledWith({ raw: false });
  //   consoleSpy.mockRestore();
  // });
});
