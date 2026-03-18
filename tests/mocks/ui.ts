import { vi } from "vitest";

import { UI } from "@lib/ui";

export const search = vi.fn();
export const input = vi.fn();
export const password = vi.fn();
export const loading = vi.fn();
export const confirmAndSearch = vi.fn();
export const progressBar = vi.fn();
export const confirm = vi.fn();
export const multiProgressBar = vi.fn();

export class MockUi implements UI {
  async input(...args: any[]) {
    return input(...args);
  }

  async password(...args: any[]) {
    return password(...args);
  }

  async search(...args: any[]) {
    return search(...args);
  }

  async promptChoice(...args: any[]) {
    return this.search(...args);
  }

  async confirmAndSearch(...args: any[]) {
    return confirmAndSearch(...args);
  }

  loading(...args: any[]) {
    return loading(...args);
  }

  async confirm(...args: any[]) {
    return confirm(...args);
  }

  multiProgressBar(...args: any[]) {
    return multiProgressBar(...args);
  }

  progressBar(...args: any[]) {
    return progressBar(...args);
  }

}

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
