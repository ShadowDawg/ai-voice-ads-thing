import { VoiceLineForPlayback } from "@/types/voice-types";

export const demoRecordingData = {
	voiceLines: [
		{
			text: "Introducing our revolutionary product that changes the way you work.",
			role: "narrator",
			voiceId: "narrator-1",
			response: {
				audio_base64: "YOUR_BASE64_AUDIO_DATA_HERE",
				alignment: {
					characters: [
						"I",
						"n",
						"t",
						"r",
						"o",
						"d",
						"u",
						"c",
						"i",
						"n",
						"g",
						" ",
						"o",
						"u",
						"r" /* etc */,
					],
					character_start_times_seconds: [0, 0.1, 0.2, 0.3 /* etc */],
					character_end_times_seconds: [0.1, 0.2, 0.3, 0.4 /* etc */],
				},
				normalized_alignment: {
					characters: [
						"I",
						"n",
						"t",
						"r",
						"o",
						"d",
						"u",
						"c",
						"i",
						"n",
						"g",
						" ",
						"o",
						"u",
						"r" /* etc */,
					],
					character_start_times_seconds: [0, 0.1, 0.2, 0.3 /* etc */],
					character_end_times_seconds: [0.1, 0.2, 0.3, 0.4 /* etc */],
				},
			},
		},
		// Repeat the same structure for other voice lines
	],
	silenceLine: {
		audio_base64: "YOUR_BASE64_AUDIO_DATA_HERE",
		alignment: {
			characters: [],
			character_start_times_seconds: [],
			character_end_times_seconds: [],
		},
		normalized_alignment: {
			characters: [],
			character_start_times_seconds: [],
			character_end_times_seconds: [],
		},
	},
};
