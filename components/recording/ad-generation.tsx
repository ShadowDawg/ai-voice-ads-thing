"use client";

import { useState, useEffect, useRef } from "react";
import { Script } from "./models";
import { PREDEFINED_SPEAKERS, Speaker } from "./speakers-info";
import { Card } from "../ui/card";
import { Loader2 } from "lucide-react";
import { ElevenLabsClient } from "elevenlabs";
import {
  getCachedVoiceLine,
  cacheVoiceLine,
  CachedVoiceLine,
} from "./voicelines-cache";
import { useRouter } from "next/navigation";
import { useVoiceLines } from "../../contexts/VoiceLinesContext";

interface AdGenerationProps {
  duration: number;
  speakers: Speaker[];
  script: Script;
  onComplete: (audioUrl: string) => void;
}

const client = new ElevenLabsClient({
  apiKey: "sk_b88e7fbea803cfd374bd9924d31d5141b5503f2c5f290c37",
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Add this interface to type the API response
interface ElevenLabsResponse {
  audio_base64: string;
  alignment: {
    characters: string[];
    character_start_times_seconds: number[];
    character_end_times_seconds: number[];
  };
  normalized_alignment: {
    characters: string[];
    character_start_times_seconds: number[];
    character_end_times_seconds: number[];
  };
}

interface VoiceLineData {
  audioBlob: Blob;
  alignment: ElevenLabsResponse["alignment"];
  normalizedAlignment: ElevenLabsResponse["normalized_alignment"];
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
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const totalLines = script.lines.length;
  const { setVoiceLines } = useVoiceLines();

  async function generateVoiceLine(
    text: string,
    voiceId: string,
    role: string
  ): Promise<VoiceLineData> {
    // First check if we have this voice line cached
    const cachedLine = getCachedVoiceLine(text, role);

    let response: ElevenLabsResponse;

    if (cachedLine) {
      console.log("Using cached voice line for:", text);
      response = cachedLine.response;
    } else {
      console.log("Generating new voice line for:", text);
      response = (await client.textToSpeech.convertWithTimestamps(voiceId, {
        output_format: "mp3_44100_128",
        text: text,
        model_id: "eleven_multilingual_v2",
      })) as ElevenLabsResponse;

      // Cache the new voice line
      await cacheVoiceLine({
        text,
        role,
        voiceId,
        response,
      });
    }

    // Convert base64 to blob
    const base64Data = response.audio_base64;
    const binaryData = atob(base64Data);
    const arrayBuffer = new ArrayBuffer(binaryData.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < binaryData.length; i++) {
      uint8Array[i] = binaryData.charCodeAt(i);
    }

    return {
      audioBlob: new Blob([uint8Array], { type: "audio/mp3" }),
      alignment: response.alignment,
      normalizedAlignment: response.normalized_alignment,
    };
  }

  async function generateAd() {
    setIsGenerating(true);
    setProgress(0);
    setIsReady(false);
    setHasConfirmed(false);
    const voiceLinesData: CachedVoiceLine[] = [];

    try {
      // Generate audio for each line
      for (let i = 0; i < script.lines.length; i++) {
        const voiceLine = script.lines[i];
        const voiceId =
          PREDEFINED_SPEAKERS[
            voiceLine.role as keyof typeof PREDEFINED_SPEAKERS
          ].voiceId;

        if (!voiceId) {
          console.warn(`No voice ID found for role: ${voiceLine.role}`);
          continue;
        }

        // Check cache or generate new voice line
        const cachedLine = getCachedVoiceLine(voiceLine.line, voiceLine.role);
        let response: ElevenLabsResponse;

        if (cachedLine) {
          console.log("Using cached voice line for:", voiceLine.line);
          response = cachedLine.response;
        } else {
          console.log("Generating new voice line for:", voiceLine.line);
          response = (await client.textToSpeech.convertWithTimestamps(voiceId, {
            output_format: "mp3_44100_128",
            text: voiceLine.line,
            model_id: "eleven_multilingual_v2",
          })) as ElevenLabsResponse;

          // Cache the new voice line
          await cacheVoiceLine({
            text: voiceLine.line,
            role: voiceLine.role,
            voiceId,
            response,
          });
        }

        voiceLinesData.push({
          text: voiceLine.line,
          role: voiceLine.role,
          voiceId,
          response,
        });

        if (i < script.lines.length - 1) {
          await sleep(1000);
        }

        setProgress(((i + 1) / totalLines) * 100);
      }

      // Instead of using router.push with query params, store the data
      setVoiceLines(voiceLinesData);

      // Navigate to the next page without query params
      const currentPath = window.location.pathname;
      router.push(currentPath + "/playback");
    } catch (error) {
      console.error("Error generating ad:", error);
    } finally {
      setIsGenerating(false);
    }
  }

  // Handle audio element loading and errors
  useEffect(() => {
    if (audioRef.current && audioUrl) {
      const audio = audioRef.current;

      const handleCanPlay = () => {
        if (audio.duration > 0) {
          // Only set ready if duration is valid
          setIsReady(true);
        }
      };

      const handleLoadedMetadata = () => {
        if (audio.duration > 0) {
          // Double check duration after metadata loads
          setIsReady(true);
        }
      };

      const handleError = (e: ErrorEvent) => {
        console.error("Audio playback error:", e);
        setIsReady(false);
      };

      audio.addEventListener("canplay", handleCanPlay);
      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
      audio.addEventListener("error", handleError as EventListener);

      // Load the audio
      audio.load();

      return () => {
        audio.removeEventListener("canplay", handleCanPlay);
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audio.removeEventListener("error", handleError as EventListener);
      };
    }
  }, [audioUrl]);

  // Cleanup effect
  useEffect(() => {
    generateAd();

    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      setIsGenerating(false);
      setProgress(0);
      setIsReady(false);
    };
  }, []);

  return (
    <Card className="p-6">
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className={`w-8 h-8 ${isGenerating ? "animate-spin" : ""}`} />
        <div className="text-center">
          <h3 className="text-lg font-medium">Generating Audio</h3>
          <p className="text-sm text-gray-500">
            {isGenerating
              ? `Generating voice lines... ${Math.round(progress)}%`
              : "Generation complete!"}
          </p>
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
