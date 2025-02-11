"use client";

import { createContext, useContext, useState } from "react";
import { CachedVoiceLine } from "../components/recording/voicelines-cache";

interface VoiceLinesContextType {
  voiceLines: CachedVoiceLine[];
  setVoiceLines: (lines: CachedVoiceLine[]) => void;
}

export const VoiceLinesContext = createContext<VoiceLinesContextType>({
  voiceLines: [],
  setVoiceLines: () => {},
});

export function VoiceLinesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [voiceLines, setVoiceLines] = useState<CachedVoiceLine[]>([]);

  return (
    <VoiceLinesContext.Provider value={{ voiceLines, setVoiceLines }}>
      {children}
    </VoiceLinesContext.Provider>
  );
}

export function useVoiceLines() {
  const context = useContext(VoiceLinesContext);
  if (undefined === context) {
    throw new Error("useVoiceLines must be used within a VoiceLinesProvider");
  }
  return context;
}
