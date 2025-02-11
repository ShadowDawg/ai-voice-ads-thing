import { z } from "zod";

export const VoiceLine = z.object({
  role: z.string(),
  line: z.string(),
});

export const Script = z.object({
  lines: z.array(VoiceLine),
});

// Add type inference
export type VoiceLine = z.infer<typeof VoiceLine>;
export type Script = z.infer<typeof Script>;
