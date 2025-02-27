import { Timestamp } from "firebase-admin/firestore";

export interface ElevenLabsVoiceResponse {
	audio_base64: string;
	alignment: {
		characters: string[];
		character_start_times_seconds: number[];
		character_end_times_seconds: number[];
	};
	normalized_alignment: {
		characters: string[];
		character_start_times_seconds: number[];
		character_end_times_seconds: number[];
	};
}
export interface VoiceLineForPlayback {
	text: string;
	role: string;
	voiceId: string;
	response: ElevenLabsVoiceResponse;
}

// structure of the stored recording in firebase
export interface StoredRecording {
	voiceLines: VoiceLineForPlayback[];
	silenceLine?: ElevenLabsVoiceResponse | null;
	duration: number;
	createdAt: Timestamp;
	title: string;
}
