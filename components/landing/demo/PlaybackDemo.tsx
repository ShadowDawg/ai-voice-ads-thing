"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Download } from "lucide-react";
import { PREDEFINED_SPEAKERS } from "@/components/recording/speakers-info";
import { VoiceLineForPlayback, StoredRecording } from "@/types/voice-types";

interface PlaybackDemoProps {
	jsonPath: string;
	description?: string;
}

export default function PlaybackDemo({
	jsonPath,
	description,
}: PlaybackDemoProps) {
	const [voiceLines, setVoiceLines] = useState<VoiceLineForPlayback[]>([]);
	const [title, setTitle] = useState<string>("Demo Recording");
	const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(
		null
	);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [currentTime, setCurrentTime] = useState(0);
	const [totalDuration, setTotalDuration] = useState(0);
	const [individualDurations, setIndividualDurations] = useState<number[]>(
		[]
	);
	const [overallTime, setOverallTime] = useState(0);

	// Load data from JSON file
	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true);
				const response = await fetch(jsonPath);
				if (!response.ok) {
					throw new Error(
						`Failed to load demo data: ${response.status}`
					);
				}

				const data: StoredRecording = await response.json();

				// Append the silence voice line to the voiceLines if it exists
				let finalVoiceLines = data.voiceLines;
				if (data.silenceLine) {
					finalVoiceLines = [
						...data.voiceLines,
						{
							text: "Silence", // Label for the UI
							role: "silence",
							voiceId: "",
							response: data.silenceLine,
						} as VoiceLineForPlayback,
					];
				}

				setVoiceLines(finalVoiceLines);
				setTitle(data.title || "Demo Recording");
			} catch (error) {
				console.error("Error loading demo data:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [jsonPath]);

	// Clean up audio on unmount
	useEffect(() => {
		return () => {
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current = null;
			}
		};
	}, []);

	const getCurrentSpeakerColor = () => {
		if (currentlyPlaying === null) return "rgb(17 24 39 / 0.5)"; // Default gray-900/50 background
		const role = voiceLines[currentlyPlaying].role;
		const speaker =
			PREDEFINED_SPEAKERS[role as keyof typeof PREDEFINED_SPEAKERS];
		return speaker?.color || "rgb(17 24 39 / 0.5)";
	};

	const formatTime = (time: number) => {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds.toString().padStart(2, "0")}`;
	};

	// Calculate total duration when voice lines change
	useEffect(() => {
		const loadDurations = async () => {
			if (voiceLines.length === 0) return;

			const durations = await Promise.all(
				voiceLines.map((line) => {
					return new Promise<number>((resolve) => {
						const audio = new Audio(
							`data:audio/mp3;base64,${line.response.audio_base64}`
						);
						audio.addEventListener("loadedmetadata", () => {
							resolve(audio.duration);
						});
						// Handle cases where the audio might fail to load
						audio.addEventListener("error", () => {
							resolve(0);
						});
					});
				})
			);
			setIndividualDurations(durations);
			setTotalDuration(
				durations.reduce((sum, duration) => sum + duration, 0)
			);
		};

		loadDurations();
	}, [voiceLines]);

	// Calculate current overall time based on previous lines and current progress
	const getCurrentOverallTime = () => {
		if (currentlyPlaying === null) return overallTime;

		const previousLinesDuration = individualDurations
			.slice(0, currentlyPlaying)
			.reduce((sum, duration) => sum + duration, 0);

		return previousLinesDuration + currentTime;
	};

	const playVoiceLine = (index: number) => {
		// Stop any currently playing audio
		if (audioRef.current) {
			audioRef.current.pause();
		}

		// Store the current overall time before transitioning
		const previousOverallTime = getCurrentOverallTime();
		setOverallTime(previousOverallTime);

		const newAudio = new Audio(
			`data:audio/mp3;base64,${voiceLines[index].response.audio_base64}`
		);

		newAudio.addEventListener("timeupdate", () => {
			setCurrentTime(newAudio.currentTime);
			// Update overall time smoothly
			setOverallTime(
				individualDurations
					.slice(0, index)
					.reduce((sum, duration) => sum + duration, 0) +
					newAudio.currentTime
			);
		});

		// Instead of updating state, we use the ref.
		audioRef.current = newAudio;
		setCurrentlyPlaying(index);
		setIsPlaying(true);

		newAudio.play();
		newAudio.onended = () => {
			// Store the final time of this line before transitioning
			const finalTimeForLine = getCurrentOverallTime();
			setOverallTime(finalTimeForLine);

			if (index < voiceLines.length - 1) {
				playVoiceLine(index + 1);
			} else {
				setCurrentlyPlaying(null);
				setIsPlaying(false);
				setCurrentTime(0);
				setOverallTime(0);
			}
		};
	};

	const togglePlayPause = () => {
		if (isPlaying) {
			audioRef.current?.pause();
			setIsPlaying(false);
		} else {
			if (currentlyPlaying !== null) {
				audioRef.current?.play();
			} else {
				playVoiceLine(0);
			}
			setIsPlaying(true);
		}
	};

	const concatenateAndDownload = async () => {
		// Create audio context
		const audioContext = new AudioContext();

		// Load and decode all audio files
		const audioBuffers = await Promise.all(
			voiceLines.map(async (line) => {
				const base64 = line.response.audio_base64;
				const response = await fetch(`data:audio/mp3;base64,${base64}`);
				const arrayBuffer = await response.arrayBuffer();
				return await audioContext.decodeAudioData(arrayBuffer);
			})
		);

		// Calculate total length
		const totalLength = audioBuffers.reduce(
			(sum, buffer) => sum + buffer.length,
			0
		);

		// Create a new buffer for the complete audio
		const finalBuffer = audioContext.createBuffer(
			audioBuffers[0].numberOfChannels,
			totalLength,
			audioBuffers[0].sampleRate
		);

		// Concatenate all buffers
		let offset = 0;
		audioBuffers.forEach((buffer) => {
			for (
				let channel = 0;
				channel < buffer.numberOfChannels;
				channel++
			) {
				const finalData = finalBuffer.getChannelData(channel);
				finalData.set(buffer.getChannelData(channel), offset);
			}
			offset += buffer.length;
		});

		// Convert to wav file and download
		const wavFile = audioBufferToWav(finalBuffer);
		const blob = new Blob([wavFile], { type: "audio/wav" });
		const url = URL.createObjectURL(blob);

		const a = document.createElement("a");
		a.href = url;
		a.download = "voice-ad-demo.wav";
		a.click();
		URL.revokeObjectURL(url);
	};

	return (
		<Card className="overflow-hidden shadow-xl rounded-xl border border-gray-800 w-full max-w-4xl mx-auto bg-black transition-all hover:border-vivid/30 hover:bg-gray-900/70">
			<div
				className="min-h-[400px] transition-colors duration-700 flex flex-col relative"
				style={{
					backgroundColor: getCurrentSpeakerColor(),
					color: "white",
				}}
			>
				{isLoading ? (
					<div className="flex-1 flex items-center justify-center">
						<p className="text-center opacity-50 text-sm">
							Loading demo...
						</p>
					</div>
				) : voiceLines.length === 0 ? (
					<div className="flex-1 flex items-center justify-center">
						<p className="text-center opacity-50 text-sm">
							No voice lines found
						</p>
					</div>
				) : (
					<>
						{/* Voice Lines - reduced font sizes */}
						<div className="p-4 flex-1 flex items-center">
							<div className="space-y-4 w-full max-w-2xl mx-auto">
								{voiceLines
									.filter((line) => line.role !== "silence") // Filter out silence lines from display
									.map((line, index) => (
										<div
											key={index}
											className={`transition-all duration-300 ${
												currentlyPlaying === index
													? "scale-105 opacity-100"
													: "opacity-50 hover:opacity-80"
											}`}
											onClick={() => playVoiceLine(index)}
										>
											<p className="text-xs mb-1 opacity-80">
												{line.role}
											</p>
											<p className="text-lg font-medium cursor-pointer">
												{line.text}
											</p>
										</div>
									))}
							</div>
						</div>

						{/* Playback Controls - reduced sizes */}
						<div className="p-4 bg-black/30 backdrop-blur-lg">
							<div className="flex flex-col gap-2">
								{/* Progress bar */}
								<div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
									<div
										className="bg-white h-full transition-all duration-150"
										style={{
											width: `${
												(getCurrentOverallTime() /
													totalDuration) *
												100
											}%`,
										}}
									/>
								</div>

								{/* Controls and time */}
								<div className="flex justify-between items-center">
									<div className="flex-1">
										{currentlyPlaying !== null && (
											<div className="text-xs opacity-80">
												{
													voiceLines[currentlyPlaying]
														.role
												}
											</div>
										)}
									</div>

									<div className="flex items-center gap-4">
										<span className="text-xs opacity-80">
											{formatTime(
												getCurrentOverallTime()
											)}
										</span>

										<Button
											onClick={togglePlayPause}
											className="rounded-full w-10 h-10 flex items-center justify-center bg-white hover:scale-105 transition-transform shadow-lg"
											aria-label={
												isPlaying ? "Pause" : "Play"
											}
										>
											{isPlaying ? (
												<Pause className="h-4 w-4 text-black" />
											) : (
												<Play className="h-4 w-4 text-black ml-0.5" />
											)}
										</Button>

										<span className="text-xs opacity-80">
											{formatTime(totalDuration)}
										</span>
									</div>

									<div className="flex-1" />
								</div>
							</div>
						</div>
					</>
				)}
			</div>
		</Card>
	);
}

function audioBufferToWav(buffer: AudioBuffer) {
	const numOfChan = buffer.numberOfChannels;
	const length = buffer.length * numOfChan * 2;
	const buffer32 = new Float32Array(buffer.length * numOfChan);
	const view = new DataView(new ArrayBuffer(44 + length));
	const channels = [];
	let offset = 0;
	let pos = 0;

	// Extract channels
	for (let i = 0; i < buffer.numberOfChannels; i++) {
		channels.push(buffer.getChannelData(i));
	}

	// Interleave channels
	for (let i = 0; i < buffer.length; i++) {
		for (let j = 0; j < numOfChan; j++) {
			buffer32[offset] = channels[j][i];
			offset++;
		}
	}

	// Write WAV header
	setUint32(0x46464952); // "RIFF"
	setUint32(36 + length); // file length
	setUint32(0x45564157); // "WAVE"
	setUint32(0x20746d66); // "fmt " chunk
	setUint32(16); // length = 16
	setUint16(1); // PCM (uncompressed)
	setUint16(numOfChan);
	setUint32(buffer.sampleRate);
	setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
	setUint16(numOfChan * 2); // block-align
	setUint16(16); // 16-bit
	setUint32(0x61746164); // "data" - chunk
	setUint32(length); // chunk length

	// Write interleaved data
	for (let i = 0; i < buffer32.length; i++) {
		setInt16(buffer32[i] * 0x7fff);
	}

	function setUint16(data: number) {
		view.setUint16(pos, data, true);
		pos += 2;
	}

	function setUint32(data: number) {
		view.setUint32(pos, data, true);
		pos += 4;
	}

	function setInt16(data: number) {
		view.setInt16(pos, data, true);
		pos += 2;
	}

	return new Uint8Array(view.buffer);
}
