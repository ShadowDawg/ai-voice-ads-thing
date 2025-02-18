"use client";

import { createContext, useContext, useState } from "react";
import { VoiceLineForPlayback } from "../components/recording/voicelines-cache";

interface VoiceLinesContextType {
	voiceLines: VoiceLineForPlayback[];
	setVoiceLines: (lines: VoiceLineForPlayback[]) => void;
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
	const [voiceLines, setVoiceLines] = useState<VoiceLineForPlayback[]>([]);

	return (
		<VoiceLinesContext.Provider value={{ voiceLines, setVoiceLines }}>
			{children}
		</VoiceLinesContext.Provider>
	);
}

export function useVoiceLines() {
	const context = useContext(VoiceLinesContext);
	if (undefined === context) {
		throw new Error(
			"useVoiceLines must be used within a VoiceLinesProvider"
		);
	}
	return context;
}
