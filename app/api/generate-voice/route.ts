import { NextResponse } from "next/server";
import { ElevenLabsClient } from "elevenlabs";
import { PREDEFINED_SPEAKERS } from "@/components/recording/speakers-info";
import { ElevenLabsVoiceResponse } from "@/types/voice-types";

// Initialize ElevenLabs client with API key from environment variable
const client = new ElevenLabsClient({
	apiKey: process.env.ELEVENLABS_API_KEY,
});

export async function POST(request: Request) {
	try {
		const { text, role } = await request.json();

		if (!text || !role) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Get voice ID for the role
		const voiceId =
			PREDEFINED_SPEAKERS[role as keyof typeof PREDEFINED_SPEAKERS]
				?.voiceId;
		if (!voiceId) {
			return NextResponse.json(
				{ error: `No voice ID found for role: ${role}` },
				{ status: 400 }
			);
		}

		// Generate new voice line with type checking
		const response = (await client.textToSpeech.convertWithTimestamps(
			voiceId,
			{
				output_format: "mp3_44100_128",
				text: text,
				model_id: "eleven_multilingual_v2",
			}
		)) as ElevenLabsVoiceResponse;

		// Verify response has required properties
		if (!response?.audio_base64) {
			throw new Error("Invalid response from ElevenLabs API");
		}

		return NextResponse.json(response);
	} catch (error) {
		console.error("Error generating voice:", error);
		return NextResponse.json(
			{ error: "Failed to generate voice line" },
			{ status: 500 }
		);
	}
}
