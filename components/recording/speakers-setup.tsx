import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { PREDEFINED_SPEAKERS, Speaker } from "./speakers-info";

interface SpeakersSetupProps {
  speakers: Speaker[];
  onChange: (speakers: Speaker[]) => void;
}

export function SpeakersSetup({ speakers, onChange }: SpeakersSetupProps) {
  const [error, setError] = useState<string | null>(null);
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>("");

  // If no speakers are defined, add a default narrator
  useEffect(() => {
    if (speakers.length === 0) {
      // Use the Narrator config from the dictionary
      const narratorConfig = PREDEFINED_SPEAKERS.Narrator;
      const newSpeaker: Speaker = {
        id: Math.random().toString(36).substr(2, 9),
        ...narratorConfig,
      };
      onChange([newSpeaker]);
    }
    // Only run on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addSpeaker = (selectedRole: string) => {
    if (speakers.length >= Object.keys(PREDEFINED_SPEAKERS).length) {
      setError(
        `Maximum of ${Object.keys(PREDEFINED_SPEAKERS).length} speakers allowed`
      );
      return;
    }

    // Get the speaker configuration directly from the dictionary
    const speakerConfig =
      PREDEFINED_SPEAKERS[selectedRole as keyof typeof PREDEFINED_SPEAKERS];
    if (!speakerConfig) return;

    // Check if this role is already added
    if (speakers.some((s) => s.role === selectedRole)) {
      setError(`A ${selectedRole} is already added`);
      return;
    }

    const newSpeaker: Speaker = {
      id: Math.random().toString(36).substr(2, 9),
      ...speakerConfig,
    };

    onChange([...speakers, newSpeaker]);
    setError(null);
    setSelectedSpeaker(""); // Reset the select value after adding a speaker
  };

  // Get available roles (roles that haven't been added yet)
  const availableRoles = Object.entries(PREDEFINED_SPEAKERS)
    .filter(([role]) => !speakers.some((s) => s.role === role))
    .map(([role, config]) => ({
      ...config,
    }));

  const removeSpeaker = (id: string) => {
    onChange(speakers.filter((speaker) => speaker.id !== id));
    setError(null);
  };

  return (
    <div className="p-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Configure Speakers
        </h2>
        <p className="text-[#B3B3B3] text-lg">
          Add and configure the voices for your ad. Start with a narrator and
          add more speakers as needed.
        </p>
      </div>

      {/* Speakers list with a minimalistic card */}
      <div className="space-y-4 mt-6">
        {speakers.map((speaker) => (
          <Card
            key={speaker.id}
            className="p-3 bg-blackLight border hover:bg-[#2A2A2A] transition-all duration-200 rounded-md"
            style={{ borderColor: speaker.color }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* <div
                  className="w-1 h-full min-h-[24px] rounded-full"
                  style={{ backgroundColor: speaker.color }}
                /> */}
                <span className="text-white capitalize">{speaker.role}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeSpeaker(speaker.id)}
                className="text-[#B3B3B3] hover:text-white hover:bg-[#3E3E3E] transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-[#F15E6C] text-sm bg-[#2A1619] px-4 py-2 rounded-md">
          {error}
        </p>
      )}

      {/* Speaker selection with color bubbles in the dropdown */}
      {availableRoles.length > 0 && (
        <div className="flex gap-4 mt-4">
          <Select value={selectedSpeaker} onValueChange={addSpeaker}>
            <SelectTrigger className="flex-1 bg-blackLight border-[#404040] text-white hover:border-cornsilk focus:border-cornsilk/80 focus:ring-cornsilk/10">
              <SelectValue placeholder="Select a speaker to add" />
            </SelectTrigger>
            <SelectContent className="bg-blackLight border-[#404040]">
              {availableRoles.map(({ role, color }) => (
                <SelectItem
                  key={role}
                  value={role}
                  className="flex items-center gap-8 text-white hover:bg-[#3E3E3E] focus:bg-[#3E3E3E] focus:text-white"
                >
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-white"> </span>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
