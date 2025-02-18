"use client";

import { useState, useEffect, useRef } from "react";
import { Script } from "./models";
import { Speaker } from "./speakers-info";
import { Card } from "../ui/card";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useVoiceLines } from "../../contexts/VoiceLinesContext";
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
	const { setVoiceLines } = useVoiceLines();
	const [generatedTitle, setGeneratedTitle] = useState<string>("");

	// Use a ref to ensure the generate logic runs only once
	const hasGeneratedRef = useRef(false);

	useEffect(() => {
		// If we've already started generation, exit early
		if (hasGeneratedRef.current) return;
		hasGeneratedRef.current = true;

		let mounted = true;

		const generate = async () => {
			if (isGenerating || !mounted) return;
			setIsGenerating(true);
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

				const token = await user.getIdToken();

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
						speakers: speakers,
						script: script,
						title: title,
					}),
				});

				if (!storeResponse.ok) {
					const errorData = await storeResponse.json();
					throw new Error(
						errorData.error || "Failed to store recording data"
					);
				}

				const storedRecording: StoredRecording & { id: string } =
					await storeResponse.json();

				// Store in context for immediate use
				setVoiceLines(storedRecording.voiceLines);

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
		<Card className="p-6 bg-blackLighter border border-blackLighter">
			<div className="flex flex-col items-center justify-center space-y-4">
				<Loader2
					className={`w-8 h-8 ${isGenerating ? "animate-spin" : ""}`}
				/>
				<div className="text-center">
					<h3 className="text-lg font-medium">Generating Audio</h3>
					<p className="text-sm text-gray-500">
						{isGenerating
							? `Generating voice lines... ${Math.round(
									progress
							  )}%`
							: "Generation complete!"}
					</p>
					{error && (
						<p className="text-sm text-red-500 mt-2">{error}</p>
					)}
				</div>

				<div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
					<div
						className="h-full bg-primary transition-all duration-300"
						style={{ width: `${progress}%` }}
					/>
				</div>
			</div>
		</Card>
	);
}
