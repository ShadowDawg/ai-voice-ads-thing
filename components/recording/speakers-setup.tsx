import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Play, Pause } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { PREDEFINED_SPEAKERS, Speaker } from "./speakers-info";
import { motion, AnimatePresence } from "framer-motion";
import { dm_sans } from "@/lib/fonts/fonts";

interface SpeakersSetupProps {
	speakers: Speaker[];
	onChange: (speakers: Speaker[]) => void;
}

export function SpeakersSetup({ speakers, onChange }: SpeakersSetupProps) {
	const [error, setError] = useState<string | null>(null);
	const [playingSpeaker, setPlayingSpeaker] = useState<string | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	// Helper function to format role names by adding spaces before capital letters
	const formatRoleName = (role: string) => {
		return role.replace(/([A-Z])/g, " $1").trim();
	};

	// Add cleanup effect to stop audio when component unmounts
	useEffect(() => {
		// Cleanup function that runs when component unmounts
		return () => {
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current.currentTime = 0;
				setPlayingSpeaker(null);
			}
		};
	}, []);

	// If no speakers are defined, add a default narrator on mount.
	useEffect(() => {
		if (speakers.length === 0) {
			// Use the Narrator config from the dictionary
			const narratorConfig = PREDEFINED_SPEAKERS.MaleNarrator;
			const newSpeaker: Speaker = {
				id: Math.random().toString(36).substr(2, 9),
				...narratorConfig,
			};
			onChange([newSpeaker]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const addSpeaker = (selectedRole: string) => {
		console.log("Adding speaker:", selectedRole);
		if (speakers.length >= Object.keys(PREDEFINED_SPEAKERS).length) {
			setError(
				`Maximum of ${
					Object.keys(PREDEFINED_SPEAKERS).length
				} speakers allowed`
			);
			return;
		}

		// If this role is already added, do not add it again.
		if (speakers.some((s) => s.role === selectedRole)) {
			console.log("Speaker already exists, not adding again");
			return;
		}

		// Get the speaker configuration directly from the dictionary.
		const speakerConfig =
			PREDEFINED_SPEAKERS[
				selectedRole as keyof typeof PREDEFINED_SPEAKERS
			];
		if (!speakerConfig) {
			console.log("Speaker config not found");
			return;
		}

		const newSpeaker: Speaker = {
			id: Math.random().toString(36).substr(2, 9),
			...speakerConfig,
		};

		console.log("Adding new speaker:", newSpeaker);
		onChange([...speakers, newSpeaker]);
		setError(null);
	};

	const removeSpeaker = (id: string) => {
		console.log("Removing speaker with ID:", id);
		onChange(speakers.filter((speaker) => speaker.id !== id));
		setError(null);
	};

	// Prepare an array of all available speakers (do not filter out selected ones).
	const allSpeakers = Object.entries(PREDEFINED_SPEAKERS).map(
		([role, config]) => ({
			...config,
		})
	);

	// Handle playing and pausing the audio sample for a speaker.
	const handlePlayPreview = (role: string, exampleFilePath: string) => {
		// Pause any currently playing audio.
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current.currentTime = 0;
		}

		// If the same speaker is already playing, toggle stop.
		if (playingSpeaker === role) {
			setPlayingSpeaker(null);
			return;
		}

		// Remove 'public' from the path as Next.js serves files from public directory at root
		const adjustedPath = exampleFilePath.replace(/^public\//, "/");
		console.log("Playing ", adjustedPath);

		const audio = new Audio(adjustedPath);
		audioRef.current = audio;
		setPlayingSpeaker(role);
		audio.play();
		audio.onended = () => {
			setPlayingSpeaker(null);
		};
	};

	return (
		<div className={`p-8 ${dm_sans.className}`}>
			<div className="space-y-2">
				<h2 className="text-3xl font-bold text-white tracking-tight">
					Configure Speakers
				</h2>
				<p className="text-[#B3B3B3] text-lg">
					Add and configure the voices for your ad. Start with a
					narrator and add more speakers as needed.
				</p>
			</div>

			{/* Grid of all speakers for preview and selection - Moved up */}
			<div className="mt-4">
				<h3 className="text-xl font-semibold text-white mb-2">
					Available Speakers
				</h3>
				<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
					{allSpeakers.map((speakerConfig) => {
						const isSelected = speakers.some(
							(s) => s.role === speakerConfig.role
						);
						return (
							<Card
								key={speakerConfig.role}
								onClick={() => {
									if (isSelected) {
										// Find the speaker ID to remove
										const speakerToRemove = speakers.find(
											(s) => s.role === speakerConfig.role
										);
										if (speakerToRemove) {
											removeSpeaker(speakerToRemove.id);
										}
									} else {
										addSpeaker(speakerConfig.role);
									}
								}}
								className={`cursor-pointer p-4 bg-blackLight hover:bg-[#3E3E3E] transition-all duration-200 rounded-md ${
									isSelected
										? "ring-2 ring-cornsilk"
										: "border border-[#404040]"
								}`}
								style={{
									borderColor: isSelected
										? speakerConfig.color
										: "#404040",
								}}
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<span
											className="inline-block w-3 h-3 rounded-full"
											style={{
												backgroundColor:
													speakerConfig.color,
											}}
										/>
										<span className="text-white capitalize font-semibold">
											{formatRoleName(speakerConfig.role)}
										</span>
									</div>
									<Button
										onClick={(e) => {
											e.stopPropagation();
											handlePlayPreview(
												speakerConfig.role,
												speakerConfig.example_file_path
											);
										}}
										variant="ghost"
										size="icon"
										className="text-white hover:bg-[#3E3E3E]"
									>
										{playingSpeaker ===
										speakerConfig.role ? (
											<Pause className="h-4 w-4" />
										) : (
											<Play className="h-4 w-4" />
										)}
									</Button>
								</div>
							</Card>
						);
					})}
				</div>
			</div>

			{/* Error message */}
			{error && (
				<p className="text-[#F15E6C] text-sm bg-[#2A1619] px-4 py-2 rounded-md mt-4">
					{error}
				</p>
			)}

			{/* Selected speakers list - Moved down and added heading */}
			<div className="mt-6">
				<h3 className="text-xl font-semibold text-white mb-2">
					Selected Speakers
				</h3>
				<div className="space-y-4">
					<AnimatePresence>
						{speakers.map((speaker) => (
							<motion.div
								key={speaker.id}
								initial={{ opacity: 0, y: -20, height: 0 }}
								animate={{ opacity: 1, y: 0, height: "auto" }}
								exit={{ opacity: 0, y: 20, height: 0 }}
								transition={{ duration: 0.3 }}
							>
								<Card
									className="p-3 bg-blackLight border hover:bg-[#2A2A2A] transition-all duration-200 rounded-md"
									style={{ borderColor: speaker.color }}
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<span className="text-white capitalize">
												{formatRoleName(speaker.role)}
											</span>
										</div>
										<Button
											variant="ghost"
											size="icon"
											onClick={() =>
												removeSpeaker(speaker.id)
											}
											className="text-[#B3B3B3] hover:text-white hover:bg-[#3E3E3E] transition-colors"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</Card>
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
}
