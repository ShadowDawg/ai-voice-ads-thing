"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, Clock } from "lucide-react";
import { Speaker } from "./speakers-info";
import { OpenAI } from "openai";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { Script, VoiceLine } from "./models";
import { dm_sans } from "@/lib/fonts/fonts";
import { motion, AnimatePresence } from "framer-motion";

interface ScriptGenerationProps {
	duration: number;
	speakers: Speaker[];
	script: Script;
	onChange: (script: Script) => void;
}

export function ScriptGeneration({
	duration,
	speakers,
	script,
	onChange,
}: ScriptGenerationProps) {
	const [prompt, setPrompt] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [isManualMode, setIsManualMode] = useState(false);
	const [manualScript, setManualScript] = useState<Script>({ lines: [] });
	const [aiScript, setAiScript] = useState<Script>({ lines: [] });
	const [animatedLineCount, setAnimatedLineCount] = useState(0);

	// Create a ref for scrolling the bottom of the AI Script block into view
	const aiScriptBottomRef = useRef<HTMLDivElement>(null);

	// Scroll smoothly to the bottom of the AI-generated script whenever a new line is added
	useEffect(() => {
		if (!isManualMode && aiScriptBottomRef.current) {
			aiScriptBottomRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [animatedLineCount, isManualMode]);

	// Helper function to format role names by adding spaces before capital letters
	const formatRoleName = (role: string) => {
		return role.replace(/([A-Z])/g, " $1").trim();
	};

	// Replace useState with useEffect for initialization
	useEffect(() => {
		if (script && script.lines) {
			// Initialize both scripts with proper structure if they're empty
			if (
				manualScript.lines.length === 0 &&
				aiScript.lines.length === 0
			) {
				setManualScript({ ...script, lines: [...script.lines] });
				setAiScript({ ...script, lines: [...script.lines] });
			}
			// Otherwise only update the active script based on mode
			else if (isManualMode) {
				setManualScript({ ...script, lines: [...script.lines] });
			} else {
				setAiScript({ ...script, lines: [...script.lines] });
			}
		}
	}, [
		script,
		isManualMode,
		manualScript.lines.length,
		aiScript.lines.length,
	]);

	// Estimate speaking duration (roughly 15 characters per second)
	const estimateDuration = (text: string) => Math.ceil(text.length / 15);

	const getTotalDuration = (lines: VoiceLine[]) => {
		return lines.reduce(
			(total, line) => total + estimateDuration(line.line),
			0
		);
	};

	// Calculate word limit based on duration
	const getWordLimit = (durationInSeconds: number) => {
		return durationInSeconds * 2; // 2 words per second
	};

	const wordLimit = getWordLimit(duration);

	// Count total words in script
	const getTotalWords = (lines: VoiceLine[]) => {
		return lines.reduce((total, line) => {
			return (
				total +
				line.line
					.trim()
					.split(/\s+/)
					.filter((word) => word.length > 0).length
			);
		}, 0);
	};

	// Check if adding more words is allowed
	const isWordLimitExceeded = (text: string, excludeIndex?: number) => {
		const currentLines = script?.lines || [];
		const otherLinesWordCount = currentLines.reduce(
			(total, line, index) => {
				if (index === excludeIndex) return total;
				return (
					total +
					line.line
						.trim()
						.split(/\s+/)
						.filter((word) => word.length > 0).length
				);
			},
			0
		);
		const newTextWordCount = text
			.trim()
			.split(/\s+/)
			.filter((word) => word.length > 0).length;
		return otherLinesWordCount + newTextWordCount > wordLimit;
	};

	const addNewLine = () => {
		const newScript = {
			...manualScript,
			lines: [
				...(manualScript?.lines || []),
				{ role: speakers[0].role, line: "" },
			],
		};
		setManualScript(newScript);
		onChange(newScript);
	};

	const removeLine = (index: number) => {
		const newScript = {
			...manualScript,
			lines: manualScript.lines.filter((_, i) => i !== index),
		};
		setManualScript(newScript);
		onChange(newScript);
	};

	const generateScript = async () => {
		try {
			setIsGenerating(true);
			setAnimatedLineCount(0);

			const response = await fetch("/api/generate-script", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					prompt,
					duration,
					speakers,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to generate script");
			}

			const data = await response.json();
			setAiScript(data);

			animateLines(data.lines);
		} catch (error) {
			console.error("Error generating script:", error);
			// You might want to add proper error handling here
		} finally {
			setIsGenerating(false);
		}
	};

	// Function to animate lines sequentially
	const animateLines = (lines: VoiceLine[]) => {
		if (!lines || lines.length === 0) return;

		setAnimatedLineCount(0);

		lines.forEach((_, index) => {
			setTimeout(() => {
				setAnimatedLineCount((prev) => prev + 1);
			}, index * 1000);
		});

		onChange({ lines });
	};

	// Handle mode switching
	const switchToManualMode = () => {
		setIsManualMode(true);

		// If manual script is empty, initialize with first speaker
		if (!manualScript.lines || manualScript.lines.length === 0) {
			const initialManualScript = {
				lines: [{ role: speakers[0]?.role || "", line: "" }],
			};
			setManualScript(initialManualScript);
			onChange(initialManualScript);
		} else {
			onChange(manualScript);
		}
	};

	const switchToAIMode = () => {
		setIsManualMode(false);
		onChange(aiScript);
	};

	// Get the active script based on current mode
	const activeScript = isManualMode ? manualScript : aiScript;

	return (
		<div className={`p-8 py-0 ${dm_sans.className}`}>
			<div className="space-y-2">
				<h2 className="text-3xl font-bold text-white tracking-tight">
					Create Your Script
				</h2>
				<p className="text-[#B3B3B3] text-lg">
					Write your ad script manually or let AI generate one for you
					based on your description.
				</p>
			</div>

			{/* Script Creation Mode Toggle */}
			<div className="flex gap-4 mt-6">
				<Button
					variant={isManualMode ? "default" : "outline"}
					onClick={switchToAIMode}
					className={`flex-1 h-12 rounded-xl transition-colors ${
						!isManualMode
							? "bg-cornsilk hover:bg-cornsilk/90 text-black font-medium"
							: "bg-neutral-800 hover:bg-neutral-700 text-cornsilk border-neutral-700"
					}`}
				>
					AI Generated
				</Button>
				<Button
					variant={isManualMode ? "outline" : "default"}
					onClick={switchToManualMode}
					className={`flex-1 h-12 rounded-xl transition-colors ${
						isManualMode
							? "bg-cornsilk hover:bg-cornsilk/90 text-black font-medium"
							: "bg-neutral-800 hover:bg-neutral-700 text-cornsilk border-neutral-700"
					}`}
				>
					Write Manually
				</Button>
			</div>

			{/* Specifications Display - Minimalist Version */}
			<div className="mt-6 border-b border-neutral-700 pb-6">
				<div className="flex items-center gap-2 mb-3">
					<span className="text-cornsilk text-sm font-medium">
						Duration
					</span>
					<div className="text-cornsilk text-sm font-medium flex items-center gap-1">
						<Clock className="h-3.5 w-3.5" />
						{duration}s
					</div>
				</div>
				<div className="flex items-center gap-2">
					<span className="text-cornsilk text-sm font-medium">
						Speakers
					</span>
					<div className="flex flex-wrap gap-2">
						{speakers.map((speaker) => (
							<div
								key={speaker.id}
								className="px-3 py-1.5 rounded-2xl bg-neutral-900 text-sm flex items-center gap-2"
								style={{
									border: `1px solid ${speaker.color}`,
								}}
							>
								<span
									className="inline-block w-3 h-3 rounded-full"
									style={{
										backgroundColor: speaker.color,
									}}
								/>
								<span className="font-medium text-cornsilk">
									{formatRoleName(speaker.role)}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>

			<div className="space-y-6 mt-6">
				{isManualMode ? (
					// Manual Script Creation
					<div className="space-y-6">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-medium text-cornsilk">
								Your Script
							</h3>
							<div className="flex flex-col items-end gap-1">
								<div className="text-sm text-gray-400">
									Estimated Duration:{" "}
									{getTotalDuration(
										manualScript?.lines || []
									)}
									s / {duration}s
								</div>
								<div
									className={`text-sm ${
										getTotalWords(
											manualScript?.lines || []
										) > wordLimit
											? "text-red-400"
											: "text-gray-400"
									}`}
								>
									Word Count:{" "}
									{getTotalWords(manualScript?.lines || [])} /{" "}
									{wordLimit}
								</div>
							</div>
						</div>

						<div className="space-y-6">
							<AnimatePresence>
								{manualScript?.lines?.map(
									(line: VoiceLine, index: number) => (
										<motion.div
											key={index}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{
												opacity: 0,
												height: 0,
												marginBottom: 0,
											}}
											transition={{ duration: 0.3 }}
											className="space-y-3"
										>
											<div className="flex items-center gap-3">
												<div className="flex items-center gap-2 bg-neutral-800 text-cornsilk text-sm rounded-lg px-3 py-2 border border-neutral-700 focus-within:border-cornsilk focus-within:ring-cornsilk">
													{speakers.find(
														(s) =>
															s.role === line.role
													) && (
														<span
															className="inline-block w-3 h-3 rounded-full"
															style={{
																backgroundColor:
																	speakers.find(
																		(s) =>
																			s.role ===
																			line.role
																	)?.color,
															}}
														/>
													)}
													<select
														value={line.role}
														onChange={(e) => {
															const newScript = {
																...manualScript,
															};
															newScript.lines[
																index
															].role =
																e.target.value;
															setManualScript(
																newScript
															);
															onChange(newScript);
														}}
														className="bg-transparent text-cornsilk border-none focus:ring-0 focus:outline-none"
													>
														{speakers.map(
															(speaker) => (
																<option
																	key={
																		speaker.id
																	}
																	value={
																		speaker.role
																	}
																>
																	{formatRoleName(
																		speaker.role
																	)}
																</option>
															)
														)}
													</select>
												</div>
												<div className="h-px flex-1 bg-neutral-700" />
												<Button
													variant="ghost"
													size="sm"
													onClick={() =>
														removeLine(index)
													}
													className="text-sec hover:text-cornsilk hover:bg-neutral-800 rounded-lg"
												>
													Remove
												</Button>
											</div>
											<Textarea
												value={line.line}
												onChange={(e) => {
													const newText =
														e.target.value;
													if (
														!isWordLimitExceeded(
															newText,
															index
														)
													) {
														const newScript = {
															...manualScript,
														};
														newScript.lines[
															index
														].line = newText;
														setManualScript(
															newScript
														);
														onChange(newScript);
													}
												}}
												className="min-h-[80px] resize-none bg-transparent border-1px-solid border-sec/60 text-cornsilk placeholder:text-gray-400 focus:border focus:border-cornsilk focus:ring-cornsilk rounded-xl p-3"
												style={{
													fontSize: "2rem",
													lineHeight: "1.5",
												}}
												placeholder="Speaker's line..."
											/>
											<div className="flex justify-between text-xs text-gray-400">
												<span>
													Words:{" "}
													{
														line.line
															.trim()
															.split(/\s+/)
															.filter(
																(word) =>
																	word.length >
																	0
															).length
													}
												</span>
												<span>
													Estimated:{" "}
													{estimateDuration(
														line.line
													)}
													s
												</span>
											</div>
										</motion.div>
									)
								)}
							</AnimatePresence>
						</div>

						<Button
							onClick={addNewLine}
							variant="outline"
							className="w-full h-12 bg-neutral-800 hover:bg-neutral-700 text-cornsilk border-neutral-700 rounded-xl transition-colors"
							disabled={
								getTotalDuration(manualScript?.lines || []) >=
									duration ||
								getTotalWords(manualScript?.lines || []) >=
									wordLimit
							}
						>
							Add Line
						</Button>
					</div>
				) : (
					// Script Generation (AI Mode)
					<div className="space-y-6">
						<div>
							<label className="block text-sm font-medium mb-3 text-gray-400">
								Describe your advertisement (Script will be
								limited to {wordLimit} words)
							</label>
							<Input
								placeholder="A compelling story about..."
								value={prompt}
								onChange={(e) => setPrompt(e.target.value)}
								onKeyDown={(e) => {
									if (
										e.key === "Enter" &&
										prompt.trim() &&
										!isGenerating
									) {
										e.preventDefault();
										generateScript();
									}
								}}
								className="h-12 bg-neutral-800 border-neutral-700 text-cornsilk placeholder:text-gray-400 focus:border-cornsilk focus:ring-cornsilk rounded-xl"
							/>
						</div>

						<Button
							onClick={generateScript}
							disabled={isGenerating || !prompt.trim()}
							className="w-full h-12 text-base font-medium rounded-xl bg-cornsilk text-black hover:bg-cornsilk/90 transition-colors"
							variant="default"
						>
							{isGenerating ? (
								<>
									<Loader2 className="mr-2 h-5 w-5 animate-spin" />
									Writing your script...
								</>
							) : (
								"Generate Script"
							)}
						</Button>

						{aiScript &&
							aiScript.lines &&
							aiScript.lines.length > 0 && (
								<div className="space-y-6 mt-8">
									<h3 className="text-lg font-medium text-cornsilk">
										Your Script
									</h3>
									<div className="space-y-6">
										<AnimatePresence>
											{aiScript.lines
												.slice(0, animatedLineCount)
												.map(
													(
														line: VoiceLine,
														index: number
													) => (
														<motion.div
															key={index}
															initial={{
																opacity: 0,
																y: 20,
															}}
															animate={{
																opacity: 1,
																y: 0,
															}}
															transition={{
																duration: 0.3,
															}}
															className="space-y-3"
														>
															<div className="flex items-center gap-3">
																<span className="px-3 py-1.5 rounded-lg bg-neutral-900 text-sm font-medium text-sec/60 flex items-center gap-2">
																	{speakers.find(
																		(s) =>
																			s.role ===
																			line.role
																	) && (
																		<span
																			className="inline-block w-3 h-3 rounded-full"
																			style={{
																				backgroundColor:
																					speakers.find(
																						(
																							s
																						) =>
																							s.role ===
																							line.role
																					)
																						?.color,
																			}}
																		/>
																	)}
																	{formatRoleName(
																		line.role
																	)}
																</span>
																<div className="h-px flex-1 bg-neutral-700" />
															</div>
															<Textarea
																value={
																	line.line
																}
																onChange={(
																	e
																) => {
																	const newScript =
																		{
																			...aiScript,
																		};
																	newScript.lines[
																		index
																	].line =
																		e.target.value;
																	setAiScript(
																		newScript
																	);
																	onChange(
																		newScript
																	);
																}}
																className="min-h-[80px] resize-none bg-transparent border-0 text-cornsilk placeholder:text-gray-400 focus:border focus:border-cornsilk focus:ring-cornsilk rounded-xl p-3"
																style={{
																	fontSize:
																		"2rem",
																	lineHeight:
																		"1.5",
																}}
																placeholder="Speaker's line..."
															/>
														</motion.div>
													)
												)}
										</AnimatePresence>
										{/* Dummy div for scrolling to the bottom */}
										<div ref={aiScriptBottomRef} />
									</div>
								</div>
							)}
					</div>
				)}
			</div>
		</div>
	);
}
