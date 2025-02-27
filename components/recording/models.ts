import { z } from "zod";
import { VoiceLine } from "./speakers-info";

export const Script = z.object({
	lines: z.array(VoiceLine),
});

// Add type inference
export type VoiceLine = z.infer<typeof VoiceLine>;
export type Script = z.infer<typeof Script>;
