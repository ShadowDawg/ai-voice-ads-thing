const PREDEFINED_SPEAKERS = {
	Narrator: {
		role: "Narrator",
		voice: "male1",
		color: "#4ECDC4", // Teal
		voiceId: "UgBBYS2sOqTuMpoF3BR0",
		example_file_path: "voice-examples/mark.mp3",
	},
	Customer: {
		role: "Customer",
		voice: "female1",
		color: "#FF6B6B", // Red
		voiceId: "bIQlQ61Q7WgbyZAL7IWj",
		example_file_path: "voice-examples/faith.mp3",
	},
	NarratorFemale: {
		role: "NarratorFemale",
		color: "#0000FF", // blue
		voice: "female2",
		voiceId: "gDnGxUcsitTxRiGHr904",
		example_file_path: "voice-examples/katie.mp3",
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

export { PREDEFINED_SPEAKERS };
