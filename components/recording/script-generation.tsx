"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Speaker } from "./speakers-info";
import { OpenAI } from "openai";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { Script, VoiceLine } from "./models";
import { dm_sans } from "@/lib/fonts/fonts";

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
			onChange(data);
		} catch (error) {
			console.error("Error generating script:", error);
			// You might want to add proper error handling here
		} finally {
			setIsGenerating(false);
		}
	};

	// Handle mode switching
	const switchToManualMode = () => {
		setIsManualMode(true);
		onChange(manualScript);
	};

	const switchToAIMode = () => {
		setIsManualMode(false);
		onChange(aiScript);
	};

	// Get the active script based on current mode
	const activeScript = isManualMode ? manualScript : aiScript;

	return (
		<div className={`p-8 `}>
			<div className="space-y-2">
				<h2 className="text-3xl font-bold text-white tracking-tight">
					Create Your Script
				</h2>
				<p className="text-[#B3B3B3] text-lg">
					Write your ad script manually or let AI generate one for you
					based on your description.
				</p>
			</div>

			{/* Specifications Display */}
			<Card className="p-4 mt-6 bg-neutral-800 border border-neutral-700 rounded-xl">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-medium text-cornsilk">
						Project Details
					</h3>
					<div className="px-3 py-1 rounded-full bg-cornsilk text-black text-sm font-medium">
						{duration}s
					</div>
				</div>
				<div className="flex flex-wrap gap-2 mt-3">
					{speakers.map((speaker) => (
						<div
							key={speaker.id}
							className="px-3 py-1.5 rounded-lg bg-neutral-900 text-sm flex items-center gap-2"
						>
							<span className="font-medium text-cornsilk">
								{speaker.role}
							</span>
						</div>
					))}
				</div>
			</Card>

			{/* Script Creation Mode Toggle */}
			<div className="flex gap-4 mt-6">
				<Button
					variant={isManualMode ? "default" : "outline"}
					onClick={switchToAIMode}
					className={`flex-1 h-12 rounded-xl transition-colors ${
						!isManualMode
							? "bg-cornsilk text-black font-medium"
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
							? "bg-cornsilk text-black font-medium"
							: "bg-neutral-800 hover:bg-neutral-700 text-cornsilk border-neutral-700"
					}`}
				>
					Write Manually
				</Button>
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
							{manualScript?.lines?.map(
								(line: VoiceLine, index: number) => (
									<div key={index} className="space-y-3">
										<div className="flex items-center gap-3">
											<select
												value={line.role}
												onChange={(e) => {
													const newScript = {
														...manualScript,
													};
													newScript.lines[
														index
													].role = e.target.value;
													setManualScript(newScript);
													onChange(newScript);
												}}
												className="bg-neutral-800 text-cornsilk text-sm rounded-lg px-3 py-2 border border-neutral-700 focus:border-cornsilk focus:ring-cornsilk"
											>
												{speakers.map((speaker) => (
													<option
														key={speaker.id}
														value={speaker.role}
													>
														{speaker.role}
													</option>
												))}
											</select>
											<div className="h-px flex-1 bg-neutral-700" />
											<Button
												variant="ghost"
												size="sm"
												onClick={() =>
													removeLine(index)
												}
												className="text-gray-400 hover:text-cornsilk hover:bg-neutral-800 rounded-lg"
											>
												Remove
											</Button>
										</div>
										<Textarea
											value={line.line}
											onChange={(e) => {
												const newText = e.target.value;
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
													setManualScript(newScript);
													onChange(newScript);
												}
											}}
											className="min-h-[80px] text-base leading-relaxed resize-none bg-neutral-800 border-neutral-700 text-cornsilk placeholder:text-gray-400 focus:border-cornsilk focus:ring-cornsilk rounded-xl p-3"
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
																word.length > 0
														).length
												}
											</span>
											<span>
												Estimated:{" "}
												{estimateDuration(line.line)}s
											</span>
										</div>
									</div>
								)
							)}
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
					// Script Generation
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
										{aiScript.lines.map(
											(
												line: VoiceLine,
												index: number
											) => (
												<div
													key={index}
													className="space-y-3"
												>
													<div className="flex items-center gap-3">
														<span className="px-3 py-1.5 rounded-lg bg-neutral-900 text-sm font-medium text-cornsilk">
															{line.role}
														</span>
														<div className="h-px flex-1 bg-neutral-700" />
													</div>
													<Textarea
														value={line.line}
														onChange={(e) => {
															const newScript = {
																...aiScript,
															};
															newScript.lines[
																index
															].line =
																e.target.value;
															setAiScript(
																newScript
															);
															onChange(newScript);
														}}
														className="min-h-[80px] text-base leading-relaxed resize-none bg-neutral-800 border-neutral-700 text-cornsilk placeholder:text-gray-400 focus:border-cornsilk focus:ring-cornsilk rounded-xl p-3"
														placeholder="Speaker's line..."
													/>
												</div>
											)
										)}
									</div>
								</div>
							)}
					</div>
				)}
			</div>
		</div>
	);
}
