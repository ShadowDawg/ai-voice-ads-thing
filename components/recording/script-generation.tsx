"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Speaker } from "./speakers-info";
import { OpenAI } from "openai";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { Script, VoiceLine } from "./models";

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

  const generateScript = async () => {
    try {
      setIsGenerating(true);

      const openai = new OpenAI({
        apiKey:
          "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",
        dangerouslyAllowBrowser: true,
      });
      const systemPrompt = `You are an expert ad script writer. Create a script for a ${duration}-second advertisement with ${
        speakers.length
      } speaker(s).
    
Speaker details:
${speakers
  .map((speaker) => `- ${speaker.role} (Voice: ${speaker.voice})`)
  .join("\n")}

Format the script with speaker names followed by their lines. Keep the total duration in mind - each line should take roughly 3-4 seconds to speak.`;

      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        model: "gpt-4o-mini",
        temperature: 0.7,
        response_format: zodResponseFormat(Script, "script"),
      });

      onChange(JSON.parse(completion.choices[0].message.content || "{}"));
    } catch (error) {
      console.error("Error generating script:", error);
      // You might want to add proper error handling here
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Specifications Display */}
      <Card className="p-6 bg-background border border-muted">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Project Details</h3>
          <div className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
            {duration}s
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {speakers.map((speaker) => (
            <div
              key={speaker.id}
              className="px-3 py-1.5 rounded-lg bg-muted/50 text-sm flex items-center gap-2"
            >
              <span className="font-medium">{speaker.role}</span>
              <span className="text-muted-foreground text-xs">
                ({speaker.voice})
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Script Generation */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-3 text-muted-foreground">
            Describe your advertisement
          </label>
          <Input
            placeholder="A compelling story about..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="h-12 text-white"
          />
        </div>

        <Button
          onClick={generateScript}
          disabled={isGenerating || !prompt.trim()}
          className="w-full h-12 text-base font-medium"
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

        {script && (
          <div className="space-y-6 mt-8">
            <h3 className="text-lg font-medium text-white">Your Script</h3>
            <div className="space-y-6">
              {script.lines.map((line: VoiceLine, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {line.role}
                    </span>
                    <div className="h-px flex-1 bg-muted" />
                  </div>
                  <Textarea
                    value={line.line}
                    onChange={(e) => {
                      const newScript = { ...script };
                      newScript.lines[index].line = e.target.value;
                      onChange(newScript);
                    }}
                    className="min-h-[80px] text-base leading-relaxed resize-none bg-muted/5 border-muted text-white"
                    placeholder="Speaker's line..."
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
