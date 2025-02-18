import { Button } from "@/components/ui/button";

const DURATIONS = [
  { label: "15 seconds", value: 15 },
  { label: "30 seconds", value: 30 },
  { label: "45 seconds", value: 45 },
  { label: "60 seconds", value: 60 },
];

interface DurationSelectorProps {
  value: number;
  onChange: (duration: number) => void;
}

export function DurationSelector({ value, onChange }: DurationSelectorProps) {
  return (
    <div className="p-8">
      <div className="space-y-2">
        <h2 className="text-3xl text-white tracking-tight">
          Select Ad Duration
        </h2>
        <p className="text-[#B3B3B3] text-lg">
          Choose how long your voice ad will be. Different durations work better
          for different platforms and purposes.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8">
        {DURATIONS.map((duration) => (
          <Button
            key={duration.value}
            variant={value === duration.value ? "default" : "outline"}
            onClick={() => onChange(duration.value)}
            className={`h-28 relative group transition-all duration-200 hover:scale-[1.02] ${
              value === duration.value
                ? "bg-cornsilk  text-white hover:bg-cornsilk/80"
                : "bg-[#282828] border-[#404040] hover:bg-[#333333] hover:border-[#505050]"
            }`}
          >
            <div className="text-center">
              <div
                className={`text-xl font-bold mb-2 ${
                  value === duration.value ? "text-black" : "text-white"
                }`}
              >
                {duration.label}
              </div>
              <div
                className={`text-sm ${
                  value === duration.value ? "text-black/80" : "text-[#B3B3B3]"
                }`}
              >
                {duration.value === 15 && "Perfect for social media"}
                {duration.value === 30 && "Standard radio spot"}
                {duration.value === 45 && "Extended message"}
                {duration.value === 60 && "Full story telling"}
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
