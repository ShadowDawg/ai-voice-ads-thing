"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { DurationSelector } from "@/components/recording/duration-selector";
import { SpeakersSetup } from "@/components/recording/speakers-setup";
import { ScriptGeneration } from "@/components/recording/script-generation";
import { Script } from "@/components/recording/models";
import { AdGeneration } from "@/components/recording/ad-generation";
import { useRouter } from "next/navigation";
import { Speaker } from "@/components/recording/speakers-info";
// import { ScriptGeneration } from "@/components/recording/script-generation";
// import { AdGeneration } from "@/components/recording/ad-generation";
// import { Playback } from "@/components/recording/playback";

type Step = "duration" | "speakers" | "script" | "generation" | "playback";

export default function NewRecordingPage() {
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

  const steps: Step[] = [
    "duration",
    "speakers",
    "script",
    "generation",
    "playback",
  ];

  const updateRecordingData = (data: Partial<typeof recordingData>) => {
    setRecordingData((prev) => ({ ...prev, ...data }));
  };

  const goToNextStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    console.log(recordingData);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  return (
    <div className="w-full min-h-screen bg-black py-12 flex justify-center">
      <Card className="p-8 w-full max-w-4xl mx-auto bg-black border-black shadow-2xl">
        {/* Progress indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-7 h-7 rounded-full ${
                    steps.indexOf(currentStep) >= index
                      ? "bg-cornsilk text-black font-medium"
                      : "bg-[#282828] text-[#B3B3B3]"
                  } flex items-center justify-center text-sm transition-all duration-300 hover:scale-110`}
                >
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-24 h-[2px] mx-2 ${
                      steps.indexOf(currentStep) > index
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
              onChange={(duration) => updateRecordingData({ duration })}
            />
          )}
          {currentStep === "speakers" && (
            <SpeakersSetup
              speakers={recordingData.speakers}
              onChange={(speakers) => updateRecordingData({ speakers })}
            />
          )}
          {currentStep === "script" && (
            <ScriptGeneration
              duration={recordingData.duration}
              speakers={recordingData.speakers}
              script={recordingData.script}
              onChange={(script) => updateRecordingData({ script })}
            />
          )}
          {currentStep === "generation" && (
            <AdGeneration
              duration={recordingData.duration}
              speakers={recordingData.speakers}
              script={recordingData.script}
              onComplete={(audioUrl) => {
                updateRecordingData({ audioUrl });
                goToNextStep();
              }}
            />
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
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
            disabled={currentStep === "playback"}
            className="bg-cornsilk text-black hover:bg-cornsilk/80 transition-all font-medium"
          >
            {currentStep === "generation" ? "Generate" : "Next"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
