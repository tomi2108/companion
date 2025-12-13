export interface IntegrationConfig {
  setup(): Promise<object> | void;
  validate(config: unknown): object;
}
