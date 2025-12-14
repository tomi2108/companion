import z from "zod/v4";

export const DeployYamlContentSchema = z.object({
  "helm-chart-master": z.object({
    image: z.object({
      tag: z.string()
    }),
    dynatrace: z.object({
      modulo: z.string(),
      tipo: z.string(),
      clave_jira: z.string(),
      issue_jira: z.string(),
      masivo_critico: z.string()
    }).optional(),
    route: z.object({
      enabled: z.boolean()
    }),
    resources: z.object({
      limits: z.object({
        cpu: z.string().or(z.number()),
        memory: z.string().or(z.number())
      }),
      requests: z.object({
        cpu: z.string().or(z.number()),
        memory: z.string().or(z.number())
      })
    }),
    autoscaling: z.object({
      enabled: z.boolean(),
      minReplicas: z.number(),
      maxReplicas: z.number()
    }),
    readinessProbe: z.object({
      enabled: z.boolean()
    }),
    configmapENV: z.object({
      ELK_LOGS: z.string().optional(),
      ELK_LOGS_DEBUG: z.string().optional(),
      STDOUT_LOGS: z.string().optional()
    }),
    labels: z.object({
      lproduct: z.string().optional(),
      lenvironment: z.string().optional()
    }),
    configmaps: z.record(z.string(), z.string()).optional(),
    secrets: z.record(z.string(), z.string()).optional()
  })
});

export type DeployYamlContent = z.infer<typeof DeployYamlContentSchema>;

