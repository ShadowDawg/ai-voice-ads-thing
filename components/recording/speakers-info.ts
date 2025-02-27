import { z } from "zod";

const PREDEFINED_SPEAKERS = {
	Narrator: {
		role: "Narrator",
		voice: "male1",
		color: "#4ECDC4", // Teal
		voiceId: "dXtC3XhB9GtPusIpNtQx",
		example_file_path: "voice-examples/hale.mp3",
		id: "1",
	},
	Customer: {
		role: "Customer",
		voice: "female1",
		color: "#FF6B6B", // Red
		voiceId: "bIQlQ61Q7WgbyZAL7IWj",
		example_file_path: "voice-examples/faith.mp3",
		id: "2",
	},
	NarratorFemale: {
		role: "NarratorFemale",
		color: "#0000FF", // blue
		voice: "female2",
		voiceId: "gDnGxUcsitTxRiGHr904",
		example_file_path: "voice-examples/katie.mp3",
		id: "3",
	},
} as const;

// Types for our speakers
export interface Speaker {
	id: string;
	role: string;
	voice: string;
	color: string;
	voiceId: string;
	example_file_path: string;
}

// Extract role values from PREDEFINED_SPEAKERS for the enum
const speakerRoles = Object.values(PREDEFINED_SPEAKERS).map(
	(speaker) => speaker.role
) as [string, ...string[]];

export const VoiceLine = z.object({
	role: z.enum(speakerRoles),
	line: z.string(),
});

export { PREDEFINED_SPEAKERS };
