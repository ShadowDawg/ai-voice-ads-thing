import { z } from "zod";

const PREDEFINED_SPEAKERS = {
	MaleNarrator: {
		role: "MaleNarrator",
		voice: "male1",
		color: "#89AC46", // Green
		voiceId: "dXtC3XhB9GtPusIpNtQx",
		example_file_path: "voice-examples/hale.mp3",
	},
	FemaleNarrator: {
		role: "FemaleNarrator",
		color: "#0000FF", // blue
		voice: "female2",
		voiceId: "gDnGxUcsitTxRiGHr904",
		example_file_path: "voice-examples/katie.mp3",
	},
	YoungWoman: {
		role: "YoungWoman",
		voice: "female1",
		color: "#D84040", // Red
		voiceId: "bIQlQ61Q7WgbyZAL7IWj",
		example_file_path: "voice-examples/faith.mp3",
	},
	YoungMan: {
		role: "YoungMan",
		voice: "male2",
		color: "#FF9D23", // Yellow
		voiceId: "TX3LPaxmHKxFdv7VOQHJ",
		example_file_path: "voice-examples/liam.mp3",
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
