"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { DurationSelector } from "@/components/recording/duration-selector";
import { SpeakersSetup } from "@/components/recording/speakers-setup";
import { ScriptGeneration } from "@/components/recording/script-generation";
import { Script } from "@/components/recording/models";
import { AdGeneration } from "@/components/recording/ad-generation";
import { useRouter } from "next/navigation";
import { Speaker } from "@/components/recording/speakers-info";
import { dm_serif } from "@/lib/fonts/fonts";
import { usePostHog } from "posthog-js/react";
// import { ScriptGeneration } from "@/components/recording/script-generation";
// import { AdGeneration } from "@/components/recording/ad-generation";
// import { Playback } from "@/components/recording/playback";

type Step = "duration" | "speakers" | "script" | "generation" | "playback";

export default function NewRecordingPage() {
	const router = useRouter();
	const posthog = usePostHog();
	const [currentStep, setCurrentStep] = useState<Step>("duration");
	const [recordingData, setRecordingData] = useState<{
		duration: number;
		speakers: Speaker[];
		script: Script;
		audioUrl: string;
	}>({
		duration: 0,
		speakers: [],
		script: { lines: [] },
		audioUrl: "",
	});

	const steps: Step[] = ["duration", "speakers", "script", "generation"];

	// Track page view and initial step
	useEffect(() => {
		// Add debugging
		console.log("Studio page mounted, PostHog instance:", posthog);

		if (posthog && typeof posthog.capture === "function") {
			console.log(
				"Attempting to capture ad_creation_process_started event"
			);
			posthog.capture("ad_creation_process_started", {
				initial_step: "duration",
			});
			console.log("Capture method called");
		} else {
			console.error("PostHog not properly initialized:", posthog);
		}
	}, [posthog]);

	// Track when the step changes
	useEffect(() => {
		if (currentStep !== "duration") {
			// posthog.capture("ad_creation_step_entered", {
			// 	step: currentStep,
			// });
		}
	}, [currentStep, posthog]);

	const updateRecordingData = (data: Partial<typeof recordingData>) => {
		setRecordingData((prev) => ({ ...prev, ...data }));

		// Track specific data updates with PostHog
		// if (data.duration) {
		// 	posthog.capture("data_ad_duration_selected", {
		// 		duration_seconds: data.duration,
		// 	});
		// }

		// if (data.speakers) {
		// 	posthog.capture("data_ad_speakers_selected", {
		// 		speaker_count: data.speakers.length,
		// 		voice_types: data.speakers.map((s) => s.voice),
		// 	});
		// }

		if (data.audioUrl) {
			posthog.capture("step_ad_generation_complete", {
				audio_url: data.audioUrl,
			});

			posthog.capture("ad_creation_process_completed", {
				audio_url: data.audioUrl,
			});
		}
	};

	const goToNextStep = () => {
		const currentIndex = steps.indexOf(currentStep);
		console.log(recordingData);
		if (currentIndex < steps.length - 1) {
			const nextStep = steps[currentIndex + 1];

			// Track step completion with specific event names
			if (currentStep === "duration") {
				posthog.capture("step_duration_selection_complete", {
					duration_seconds: recordingData.duration,
					time_spent_seconds: getTimeSpentOnStep(currentStep),
				});
			} else if (currentStep === "speakers") {
				posthog.capture("step_speaker_setup_complete", {
					speaker_count: recordingData.speakers.length,
					voice_types: recordingData.speakers.map((s) => s.voice),
					time_spent_seconds: getTimeSpentOnStep(currentStep),
				});
			} else if (currentStep === "script") {
				posthog.capture("step_script_generation_complete", {
					line_count: recordingData.script.lines?.length || 0,
					time_spent_seconds: getTimeSpentOnStep(currentStep),
				});
			} else if (currentStep === "generation") {
				// posthog.capture("step_ad_generation_complete", {
				// 	duration_seconds: recordingData.duration,
				// 	speaker_count: recordingData.speakers.length,
				// 	time_spent_seconds: getTimeSpentOnStep(currentStep),
				// });
			}

			setCurrentStep(nextStep);
			// Reset the step start time for the new step
			setStepStartTimes((prev) => ({
				...prev,
				[nextStep]: Date.now(),
			}));
		}
	};

	const goToPreviousStep = () => {
		const currentIndex = steps.indexOf(currentStep);
		if (currentIndex > 0) {
			const prevStep = steps[currentIndex - 1];

			// Track step back navigation
			posthog.capture("ad_creation_process_step_back", {
				from_step: currentStep,
				to_step: prevStep,
			});

			setCurrentStep(prevStep);
			// Reset the step start time for the previous step
			setStepStartTimes((prev) => ({
				...prev,
				[prevStep]: Date.now(),
			}));
		}
	};

	// Track time spent on each step
	const [stepStartTimes, setStepStartTimes] = useState<Record<Step, number>>({
		duration: Date.now(),
		speakers: 0,
		script: 0,
		generation: 0,
		playback: 0,
	});

	const getTimeSpentOnStep = (step: Step): number => {
		if (!stepStartTimes[step]) return 0;
		return Math.floor((Date.now() - stepStartTimes[step]) / 1000);
	};

	// posthog.capture("ad_creation_process_started", {
	// 	initial_step: "duration",
	// });

	return (
		<div className="min-h-screen bg-black">
			<div className="max-w-7xl mx-auto">
				<div className="p-8">
					<h1
						className={`${dm_serif.className} text-vivid text-5xl font-bold`}
					>
						Addie Studio
					</h1>
				</div>
			</div>

			<div className="flex justify-center">
				<Card className="p-2 w-full max-w-4xl mx-auto bg-black border-black shadow-2xl">
					{/* Back to Studio button */}
					<button
						onClick={() => {
							posthog.capture("ad_creation_process_abandoned", {
								last_step: currentStep,
								time_spent_seconds:
									getTimeSpentOnStep(currentStep),
							});
							router.back();
						}}
						className="text-white hover:text-cornsilk mb-6 transition-all"
					>
						{"< Home"}
					</button>

					{/* Progress indicator */}
					<div className="mb-10">
						<div className="flex items-center justify-between">
							{steps.map((step, index) => (
								<div
									key={step}
									className="flex items-center justify-center relative w-full"
								>
									<div
										className={`w-7 h-7 rounded-full ${
											steps.indexOf(currentStep) >= index
												? "bg-cornsilk text-black font-medium"
												: "bg-[#282828] text-[#B3B3B3]"
										} flex items-center justify-center text-sm transition-all duration-300 hover:scale-110 z-10`}
									>
										{index + 1}
									</div>
									{index < steps.length - 1 && (
										<div
											className={`absolute h-[2px] left-1/2 right-0 w-full ${
												steps.indexOf(currentStep) >
												index
													? "bg-cornsilk"
													: "bg-[#282828]"
											}`}
										/>
									)}
								</div>
							))}
						</div>
					</div>

					{/* Step content */}
					<div className="mb-10 bg-blackLight p-6 rounded-lg">
						{currentStep === "duration" && (
							<DurationSelector
								value={recordingData.duration}
								onChange={(duration) =>
									updateRecordingData({ duration })
								}
							/>
						)}
						{currentStep === "speakers" && (
							<SpeakersSetup
								speakers={recordingData.speakers}
								onChange={(speakers) =>
									updateRecordingData({ speakers })
								}
							/>
						)}
						{currentStep === "script" && (
							<ScriptGeneration
								duration={recordingData.duration}
								speakers={recordingData.speakers}
								script={recordingData.script}
								onChange={(script) =>
									updateRecordingData({ script })
								}
							/>
						)}
						{currentStep === "generation" && (
							<AdGeneration
								duration={recordingData.duration}
								speakers={recordingData.speakers}
								script={recordingData.script}
								onComplete={(audioUrl) => {
									updateRecordingData({ audioUrl });
									posthog.capture(
										"ad_creation_process_completed",
										{
											total_time_seconds:
												getTotalTimeSpent(),
											duration_seconds:
												recordingData.duration,
											speaker_count:
												recordingData.speakers.length,
										}
									);
									goToNextStep();
								}}
							/>
						)}
					</div>

					{/* Navigation buttons */}
					<div className="flex justify-between mb-10">
						<Button
							variant="outline"
							onClick={goToPreviousStep}
							disabled={currentStep === "duration"}
							className="border-[#282828] text-white hover:bg-[#282828] hover:text-white transition-all bg-blackLight"
						>
							Back
						</Button>
						<Button
							onClick={goToNextStep}
							disabled={
								currentStep === "playback" ||
								currentStep === "generation" ||
								(currentStep === "duration" &&
									recordingData.duration === 0) ||
								(currentStep === "speakers" &&
									recordingData.speakers.length === 0) ||
								(currentStep === "script" &&
									(!recordingData.script.lines ||
										recordingData.script.lines.length ===
											0 ||
										recordingData.script.lines.some(
											(line) => !line.line.trim()
										)))
							}
							className="bg-cornsilk text-black hover:bg-cornsilk/80 transition-all font-medium"
						>
							Next
						</Button>
					</div>
				</Card>
			</div>
		</div>
	);

	// Helper function to calculate total time spent
	function getTotalTimeSpent(): number {
		let total = 0;
		for (const step of steps) {
			if (step === currentStep) {
				total += getTimeSpentOnStep(step);
			} else if (stepStartTimes[step] > 0) {
				// For completed steps
				const nextStepIndex = steps.indexOf(step) + 1;
				if (nextStepIndex < steps.length) {
					const nextStep = steps[nextStepIndex];
					if (stepStartTimes[nextStep] > 0) {
						total += Math.floor(
							(stepStartTimes[nextStep] - stepStartTimes[step]) /
								1000
						);
					}
				}
			}
		}
		return total;
	}
}
