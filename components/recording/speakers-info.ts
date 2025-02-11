const PREDEFINED_SPEAKERS = {
  Narrator: {
    role: "Narrator",
    voice: "male1",
    color: "#4ECDC4", // Teal
    voiceId: "TX3LPaxmHKxFdv7VOQHJ",
  },
  Customer: {
    role: "Customer",
    voice: "female1",
    color: "#FF6B6B", // Red
    voiceId: "bIQlQ61Q7WgbyZAL7IWj",
  },
  NarratorFemale: {
    role: "NarratorFemale",
    color: "#0000FF", // blue
    voice: "female2",
    voiceId: "gDnGxUcsitTxRiGHr904",
  },
} as const;

// Types for our speakers
export interface Speaker {
  id: string;
  role: string;
  voice: string;
  color: string;
  voiceId: string;
}

export { PREDEFINED_SPEAKERS };
