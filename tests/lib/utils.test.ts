import "../mocks/config";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import * as utils from "../../src/lib/utils";
import fs from "node:fs";
import crypto from "node:crypto";
import { Config } from "../../src/lib/config";
import openEditor from "open-editor";
import open from "open";

vi.mock("node:fs");
vi.mock("node:crypto");
vi.mock("open-editor", () => ({ default: vi.fn() }));
vi.mock("open", () => ({ default: vi.fn() }));

const fsExistsMock = fs.existsSync as Mock;
const fsReadDirMock = fs.readdirSync as Mock;
const fsReadFileMock = fs.readFileSync as Mock;
const configGetMock = Config.get as Mock;
const cryptoCreateHashMock = crypto.createHash as Mock;

describe("utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deepMerge merges nested objects", () => {
    const a = { x: 1, y: { z: 2 } };
    const b = { y: { z: 3, w: 4 }, k: 9 };
    const result = utils.deepMerge(a, b);
    expect(result).toEqual({ x: 1, y: { z: 3, w: 4 }, k: 9 });
  });

  it("removePrefix removes prefix", () => {
    expect(utils.removePrefix("prefix-value", "prefix-")).toBe("value");
    expect(utils.removePrefix("nochange", "prefix-")).toBe("nochange");
  });

  it("removeSuffix removes suffix", () => {
    expect(utils.removeSuffix("value-suffix", "-suffix")).toBe("value");
    expect(utils.removeSuffix("nochange", "-suffix")).toBe("nochange");
  });

  it("readdirs returns directories", () => {
    fsExistsMock.mockReturnValue(true);
    fsReadDirMock.mockReturnValue([
      { name: "dir", isDirectory: () => true },
      { name: "file.txt", isDirectory: () => false }
    ]);
    const result = utils.readdirs("/some/path");
    expect(result).toHaveLength(1);
    expect(result?.[0].name).toBe("dir");
  });

  it("readfiles returns file names", () => {
    fsReadDirMock.mockReturnValue([
      { name: "a.txt", isFile: () => true },
      { name: "dir", isFile: () => false }
    ]);
    const result = utils.readfiles("/some/path");
    expect(result).toEqual(["a.txt"]);
  });

  it("md5FromFile returns md5 hash", () => {
    fsReadFileMock.mockReturnValue(Buffer.from("data"));
    const mockHash = {
      update: vi.fn().mockReturnThis(),
      digest: vi.fn().mockReturnValue("abc123")
    };
    cryptoCreateHashMock.mockReturnValue(mockHash);
    const result = utils.md5FromFile("file.txt");
    expect(result).toBe("abc123");
  });

  it("kebabToCamel converts string", () => {
    expect(utils.kebabToCamel("some-key-name")).toBe("someKeyName");
  });

  it("openInBrowser calls open with browser if set", async () => {
    configGetMock.mockReturnValue({ preferences: { browser: "firefox" } });
    await utils.openInBrowser("http://example.com");
    expect(open).toHaveBeenCalledWith("http://example.com", { app: { name: "firefox" } });
  });

  it("openInBrowser calls open without browser if not set", async () => {
    configGetMock.mockReturnValue({ preferences: {} });
    await utils.openInBrowser("http://example.com");
    expect(open).toHaveBeenCalledWith("http://example.com");
  });

  it("openInEditor calls openEditor with editor", async () => {
    configGetMock.mockReturnValue({ preferences: { editor: "vscode" } });
    await utils.openInEditor("/file.txt", { wait: true });
    expect(openEditor).toHaveBeenCalledWith([{ file: "/file.txt" }], { wait: true, editor: "vscode" });
  });

  it("getCurrentPath returns cwd", () => {
    expect(utils.getCurrentPath()).toBe(process.cwd());
  });

  it("tryParseJSONObject returns parsed object or false", () => {
    expect(utils.tryParseJSONObject("{\"a\":1}")).toEqual({ a: 1 });
    expect(utils.tryParseJSONObject("not-json")).toBe(false);
  });

  it("removeDuplicates removes duplicates", () => {
    expect(utils.removeDuplicates([1, 2, 2, 3])).toEqual([1, 2, 3]);
  });

  it("parseKeyVal parses key=value pairs", () => {
    const input = "KEY1=val1\nKEY2=val2\n\nINVALID";
    const result = utils.parseKeyVal(input);
    expect(result).toEqual({ KEY1: "val1", KEY2: "val2" });
  });

  it("toYaml converts object to YAML", () => {
    const yaml = utils.toYaml({ a: 1 });
    expect(yaml).toContain("a: 1");
  });
});

