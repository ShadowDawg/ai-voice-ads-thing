"use client";

import { useState, useEffect, useRef } from "react";
import { Script } from "./models";
import { Speaker } from "./speakers-info";
import { Card } from "../ui/card";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { ElevenLabsVoiceResponse, StoredRecording } from "@/types/voice-types";

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

				// If generated audio is shorter than desired duration, add silence
				if (totalGeneratedDuration < duration) {
					const silenceDuration = duration - totalGeneratedDuration;

					// Create silence audio using smaller chunks to prevent stack overflow
					const sampleRate = 44100;
					const channels = 1;
					const chunkSize = 44100; // Process 1 second at a time
					const totalSamples = Math.floor(
						sampleRate * silenceDuration
					);
					const chunks = Math.ceil(totalSamples / chunkSize);

					const silenceBase64 = await new Promise<string>(
						(resolve) => {
							const offlineContext = new OfflineAudioContext(
								channels,
								totalSamples,
								sampleRate
							);

							// Create silence in chunks
							for (let i = 0; i < chunks; i++) {
								const source =
									offlineContext.createBufferSource();
								const currentChunkSize = Math.min(
									chunkSize,
									totalSamples - i * chunkSize
								);

								const chunkBuffer = offlineContext.createBuffer(
									channels,
									currentChunkSize,
									sampleRate
								);

								source.buffer = chunkBuffer;
								source.connect(offlineContext.destination);
								source.start(i);
							}

							offlineContext
								.startRendering()
								.then((renderedBuffer) => {
									// Convert to WAV more efficiently
									const wav = new Int16Array(
										renderedBuffer.length
									);
									const channelData =
										renderedBuffer.getChannelData(0);

									// Convert Float32 to Int16 directly
									for (
										let i = 0;
										i < channelData.length;
										i++
									) {
										const s = Math.max(
											-1,
											Math.min(1, channelData[i])
										);
										wav[i] =
											s < 0 ? s * 0x8000 : s * 0x7fff;
									}

									// Create WAV header
									const header = new ArrayBuffer(44);
									const headerView = new DataView(header);

									// WAV header (simplified)
									writeString(headerView, 0, "RIFF");
									headerView.setUint32(
										4,
										36 + wav.length * 2,
										true
									);
									writeString(headerView, 8, "WAVE");
									writeString(headerView, 12, "fmt ");
									headerView.setUint32(16, 16, true);
									headerView.setUint16(20, 1, true);
									headerView.setUint16(22, 1, true);
									headerView.setUint32(24, sampleRate, true);
									headerView.setUint32(
										28,
										sampleRate * 2,
										true
									);
									headerView.setUint16(32, 2, true);
									headerView.setUint16(34, 16, true);
									writeString(headerView, 36, "data");
									headerView.setUint32(
										40,
										wav.length * 2,
										true
									);

									// Combine header and data
									const combinedArray = new Uint8Array(
										header.byteLength + wav.length * 2
									);
									combinedArray.set(new Uint8Array(header));
									combinedArray.set(
										new Uint8Array(wav.buffer),
										header.byteLength
									);

									// Use the helper function to convert the data to base64 in chunks
									const base64 =
										uint8ArrayToBase64(combinedArray);
									resolve(base64);
								});
						}
					);

					// Add silence as the last voice line
					generatedVoiceLines.push({
						audio_base64: silenceBase64,
						alignment: {
							characters: [""],
							character_start_times_seconds: [
								totalGeneratedDuration,
							],
							character_end_times_seconds: [duration],
						},
						normalized_alignment: {
							characters: [""],
							character_start_times_seconds: [
								totalGeneratedDuration,
							],
							character_end_times_seconds: [duration],
						},
					});
				}

				console.log("Storing Response...");
				console.log(script);

				// Before storing, we need to prepare the voice lines without the silence
				const voiceLinesForStorage = generatedVoiceLines.slice(
					0,
					script.lines.length
				);

				// Store the recording data through our API
				const storeResponse = await fetch("/api/store-recording", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						voiceLines: voiceLinesForStorage,
						silenceLine:
							totalGeneratedDuration < duration
								? generatedVoiceLines[
										generatedVoiceLines.length - 1
								  ]
								: null,
						duration: duration,
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
