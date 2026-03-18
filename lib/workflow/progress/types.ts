export interface ProgressController {
  root(label?: string, total?: number): ProgressScope;
}

export interface ProgressScope {
  child(label?: string, total?: number): ProgressScope;
  increment(n?: number, label?: string): void;
  close(): void;
}
