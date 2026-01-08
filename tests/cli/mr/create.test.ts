// import create from "../../../src/cli/clair/mr/create";
import { it } from "vitest";
it("", () => { });
// import * as ui from "../../../src/lib/ui";
// import "../mocks/config";
// import { Repo } from "../../../src/interface/files/repo";
// const handler = create.handler;
//
// vi.mock("../../../src/interface/glab/glab", () => ({
//   git: vi.fn().mockReturnValue({
//     fetch: vi.fn().mockResolvedValue({}),
//     branchLocal: vi.fn().mockResolvedValue({ all: ["main", "feature-branch"] }),
//     commit: vi.fn().mockResolvedValue({ commit: true }),
//     checkout: vi.fn().mockResolvedValue(undefined),
//     push: vi.fn().mockResolvedValue(undefined),
//     getConfig: vi.fn().mockResolvedValue({ value: "https://example.com/repo.git" }),
//     log: vi.fn().mockResolvedValue({ all: [{ message: "Initial commit" }] })
//   }),
//   Gitlab: vi.fn().mockImplementation(() => ({
//     getUser: vi.fn().mockResolvedValue({ id: 1 }),
//     MergeRequests: {
//       create: vi.fn().mockResolvedValue({
//         id: 123,
//         title: "MR Title",
//         merge: vi.fn().mockResolvedValue(true)
//       }),
//       all: vi.fn().mockResolvedValue([])
//     }
//   })),
//   glab: vi.fn().mockReturnValue({
//     MergeRequests: {
//       create: vi.fn().mockResolvedValue({
//         id: 123,
//         title: "MR Title",
//         merge: vi.fn().mockResolvedValue(true)
//       })
//     }
//   })
// }));
//
// vi.mock("../../../lib/ui", () => ({
//   search: vi.fn().mockResolvedValue("feature-branch"),
//   confirm: vi.fn().mockResolvedValue(true),
//   loading: vi.fn().mockReturnValue({
//     succeed: vi.fn()
//   })
// }));
//
// vi.mock("../../../lib/utils", () => ({
//   getCurrentPath: vi.fn().mockReturnValue("/fake/path/to/repo"),
//   isGitRepo: vi.fn().mockReturnValue(true)
// }));
//
// beforeEach(() => {
//   vi.clearAllMocks();
// });
//
// const search = ui.search as Mock;
// const loading = ui.search as Mock;
// const confirm = ui.search as Mock;
//
// describe("Mr create", () => {
//   it("should create and merge the merge request", async () => {
//     await handler();
//
//     expect(Repo).toHaveBeenCalledWith("/fake/path/to/repo");
//     expect(Repo.prototype.getBranches).toHaveBeenCalled();
//     expect(Repo.prototype.getActiveBranch).toHaveBeenCalled();
//     expect(search).toHaveBeenCalledWith({ choices: ["main", "feature-branch"], message: "Choose target branch" });
//     expect(confirm).toHaveBeenCalledWith({ initial: false, message: "Add default reviewer? (default_reviewer@example.com)" });
//     expect(confirm).toHaveBeenCalledWith({ message: "Merge?" });
//
//     expect(Repo.prototype.createMr).toHaveBeenCalledWith("feature-branch", { reviewer: "default_reviewer@example.com" });
//     expect(Repo.prototype.createAndMergeMr).toHaveBeenCalledWith("feature-branch");
//
//     expect(loading().succeed).toHaveBeenCalled();
//     expect(confirm).toHaveBeenCalledWith({ message: "Open MR Title in browser?" });
//   });
//
//   it("should not create and merge MR if user declines", async () => {
//     confirm.mockResolvedValueOnce(false);
//
//     await handler();
//
//     expect(Repo.prototype.createMr).not.toHaveBeenCalled();
//     expect(Repo.prototype.createAndMergeMr).toHaveBeenCalledWith("feature-branch");
//   });
//
//   it("should not add the reviewer if the user declines", async () => {
//     confirm.mockResolvedValueOnce(false);
//
//     await handler();
//
//     expect(Repo.prototype.createMr).toHaveBeenCalledWith("feature-branch", { reviewer: undefined });
//   });
// });

