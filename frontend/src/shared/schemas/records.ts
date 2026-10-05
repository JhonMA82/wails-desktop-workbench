import { z } from 'zod';
export const resourceIdSchema = z.string().min(1).brand<'ResourceId'>();
export const documentSchema = z.object({
  id: z.string().min(1),
  resource: resourceIdSchema,
  title: z.string(),
  type: z.string(),
  dirty: z.boolean(),
  metadata: z.record(z.string(), z.string()),
  value: z.number(),
});
export type DocumentRecord = z.infer<typeof documentSchema>;
export type ResourceId = z.infer<typeof resourceIdSchema>;
export const settingsSchema = z.object({
  schemaVersion: z.literal(1),
  theme: z.enum(['dark', 'light']),
  density: z.enum(['compact', 'comfortable']).default('compact'),
  ribbonMode: z.enum(['full', 'slim', 'hidden']),
  restoreWorkspace: z.boolean(),
});
export type UserSettings = z.infer<typeof settingsSchema>;
export const workspaceSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string(),
  title: z.string(),
  documents: z.array(documentSchema),
  activeDocument: z.string(),
  layout: z.string(),
  trust: z.enum(['trusted', 'untrusted']),
});
export type WorkspaceRecord = z.infer<typeof workspaceSchema>;
export const diagnosticSchema = z.object({
  level: z.enum(['info', 'warning', 'error']),
  message: z.string(),
  at: z.string(),
});
export type Diagnostic = z.infer<typeof diagnosticSchema>;
export const jobSchema = z.object({
  id: z.string(),
  type: z.string(),
  status: z.enum(['queued', 'running', 'completed', 'cancelled', 'failed']),
  progress: z.number(),
  message: z.string(),
  startedAt: z.string(),
  error: z.string(),
  result: z.object({ message: z.string() }).optional(),
});
export type Job = z.infer<typeof jobSchema>;
export const sessionSchema = z.object({
  settings: settingsSchema,
  workspace: workspaceSchema.nullable(),
  diagnostics: z.array(diagnosticSchema),
});
export type Session = z.infer<typeof sessionSchema>;
export const defaultSettings: UserSettings = {
  schemaVersion: 1,
  theme: 'dark',
  density: 'compact',
  ribbonMode: 'full',
  restoreWorkspace: true,
};
