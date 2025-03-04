"use client";

import { useState, useEffect, useRef } from "react";
import { Script } from "./models";
import { Speaker } from "./speakers-info";
import { Card } from "../ui/card";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { ElevenLabsVoiceResponse, StoredRecording } from "@/types/voice-types";
import posthog from "posthog-js";

interface AdGenerationProps {
	duration: number;
	speakers: Speaker[];
	script: Script;
	onComplete: (audioUrl: string) => void;
}

export function AdGeneration({
	duration,
	speakers,
	script,
	onComplete,
}: AdGenerationProps) {
	const router = useRouter();
	const [isGenerating, setIsGenerating] = useState(false);
	const [progress, setProgress] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const totalLines = script.lines.length;
	const [generatedTitle, setGeneratedTitle] = useState<string>("");

	// Use a ref to ensure the generate logic runs only once
	const hasGeneratedRef = useRef(false);

	useEffect(() => {
		// If we've already started generation, exit early
		if (hasGeneratedRef.current) return;
		hasGeneratedRef.current = true;

		let mounted = true;

		// Set isGenerating to true immediately to start the animation
		setIsGenerating(true);

		const generate = async () => {
			if (!mounted) return;

			setProgress(0);
			setError(null);

			try {
				// Generate title first
				const titleResponse = await fetch("/api/generate-title", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ script }),
				});

				if (!titleResponse.ok) {
					throw new Error("Failed to generate title");
				}

				const { title } = await titleResponse.json();
				console.log("Generated title:", title);
				setGeneratedTitle(title);

				const auth = getAuth();
				const user = auth.currentUser;

				if (!user) {
					throw new Error("User not authenticated");
				}

				// Force refresh the token to ensure it's not expired
				const token = await user.getIdToken(true);
				console.log("Token retrieved, length:", token.length);

				const generatedVoiceLines: ElevenLabsVoiceResponse[] = [];
				// Generate audio for each line
				for (let i = 0; i < script.lines.length; i++) {
					const voiceLine = script.lines[i];

					// if the line is empty or only contains whitespaces, skip it
					if (!voiceLine.line.trim()) {
						continue;
					}

					const response = await fetch("/api/generate-voice", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							text: voiceLine.line,
							role: voiceLine.role,
						}),
					});

					if (!response.ok) {
						throw new Error(
							`Failed to generate voice line: ${await response.text()}`
						);
					}

					const data: ElevenLabsVoiceResponse = await response.json();
					generatedVoiceLines.push(data);

					setProgress(((i + 1) / totalLines) * 100);
				}

				// Calculate total duration of generated audio
				const calculateTotalDuration = (
					voiceLines: ElevenLabsVoiceResponse[]
				): number => {
					return voiceLines.reduce((total, line) => {
						const lastCharEndTime =
							line.alignment.character_end_times_seconds;
						return (
							total + lastCharEndTime[lastCharEndTime.length - 1]
						);
					}, 0);
				};

				const totalGeneratedDuration =
					calculateTotalDuration(generatedVoiceLines);

				console.log("totalGeneratedDuration", totalGeneratedDuration);

				console.log("Storing Response...");
				console.log(script);

				// Store the recording data through our API
				const storeResponse = await fetch("/api/store-recording", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						voiceLines: generatedVoiceLines,
						duration: duration,
						actualDuration: totalGeneratedDuration,
						speakers: speakers,
						script: script,
						title: title,
					}),
				});

				// Add more detailed error handling
				if (!storeResponse.ok) {
					const errorText = await storeResponse.text();
					let errorMessage = "Failed to store recording data";

					try {
						const errorData = JSON.parse(errorText);
						errorMessage = errorData.error || errorMessage;
					} catch (e) {
						// If parsing fails, use the raw text
						errorMessage = errorText || errorMessage;
					}

					console.error("Store response error:", errorMessage);
					throw new Error(errorMessage);
				}

				const storedRecording: StoredRecording & { id: string } =
					await storeResponse.json();

				// Navigate to the playback page
				router.push(`/studio/playback?id=${storedRecording.id}`);
			} catch (error: unknown) {
				if (mounted) {
					setError(
						error instanceof Error
							? error.message
							: "An unknown error occurred"
					);
					setIsGenerating(false);
					console.error("Error generating ad:", error);
				}
			}
		};

		generate();

		return () => {
			mounted = false;
			setIsGenerating(false);
			setProgress(0);
		};
	}, []); // Keep the empty dependency array

	// useEffect(() => {
	// 	posthog.capture("step_ad_generation_complete", {});

	// 	posthog.capture("ad_creation_process_completed", {});
	// }, []);

	return (
		<Card className="p-6 bg-prim border border-blackLighter">
			<div className="flex flex-col items-center justify-center space-y-4">
				<Loader2
					className={`w-8 h-8 ${
						isGenerating ? "animate-spin" : ""
					} text-sec/80 animate-spin`}
				/>
				<div className="text-center">
					<h3 className="text-lg font-medium text-sec">
						Generating Audio
					</h3>
					<p className="text-sm text-sec/80">
						{isGenerating
							? `Generating voice lines... ${Math.round(
									progress
							  )}%`
							: error
							? "Generation failed"
							: "Starting generation..."}
					</p>
					{error && (
						<p className="text-sm text-red-500 mt-2">{error}</p>
					)}
				</div>

				<div className="w-full h-2 bg-prim rounded-full overflow-hidden">
					<div
						className="h-full bg-sec transition-all duration-300"
						style={{ width: `${progress}%` }}
					/>
				</div>
			</div>
		</Card>
	);
}

function uint8ArrayToBase64(u8a: Uint8Array): string {
	const chunkSize = 0x8000; // 32768 bytes per chunk
	let binary = "";
	for (let i = 0; i < u8a.length; i += chunkSize) {
		binary += String.fromCharCode.apply(
			null,
			Array.from(u8a.subarray(i, i + chunkSize))
		);
	}
	return btoa(binary);
}

function writeString(view: DataView, offset: number, string: string): void {
	for (let i = 0; i < string.length; i++) {
		view.setUint8(offset + i, string.charCodeAt(i));
	}
}
