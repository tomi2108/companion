import { vi } from "vitest";

export const search = vi.fn();
export const input = vi.fn();

export const mockSearch = (
  result: string | string[] | Parameters<typeof search.mockImplementationOnce>[0],
  opts?: { once?: boolean }
) => {
  if (typeof result === "function") {
    if (opts?.once) return search.mockImplementationOnce(result);
    else return search.mockImplementation(result);
  }
  if (opts?.once) return search.mockResolvedValueOnce(result);
  else return search.mockResolvedValue(result);
};

export const mockInput = (result: string) => input.mockResolvedValueOnce(result);

vi.mock("@lib/ui", async () => ({
  ...await vi.importActual("@lib/ui"),
  search,
  input
}));
