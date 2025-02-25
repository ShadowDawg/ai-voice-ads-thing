"use client";

import { useQuery } from "@tanstack/react-query";
import { StoredRecording } from "@/types/voice-types";
import Link from "next/link";
import { dm_serif, dm_sans } from "@/lib/fonts/fonts";

// Add interface to include the document ID
interface RecordingWithId extends StoredRecording {
	docId: string;
}

async function fetchRecordings(userId: string): Promise<RecordingWithId[]> {
	const response = await fetch(`/api/recordings?userId=${userId}`);
	if (!response.ok) {
		throw new Error("Network response was not ok");
	}
	return response.json();
}

export function RecordingsList({ userId }: { userId: string }) {
	const {
		data: recordings,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["recordings", userId],
		queryFn: () => fetchRecordings(userId),
	});

	if (isLoading) {
		return (
			<div className="flex justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cornsilk" />
			</div>
		);
	}

	if (isError) {
		return (
			<div className="text-red-400 text-center font-medium">
				Error loading recordings:{" "}
				{error instanceof Error ? error.message : "Unknown error"}
			</div>
		);
	}

	if (!recordings?.length) {
		return (
			<div className="text-cornsilk/80 text-center italic">
				No recordings yet. Create your first one!
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
			{recordings?.map((recording) => (
				<Link
					key={recording.docId}
					href={`/studio/playback?id=${recording.docId}`}
					className="bg-prim/70 backdrop-blur-sm rounded-2xl p-6 hover:bg-black/40 transition-all hover:scale-[1.02] cursor-pointer block border border-cornsilk/10 group"
				>
					<h3
						className={`${dm_serif.className} text-2xl text-cornsilk mb-3`}
					>
						{recording.title}
					</h3>
					<div
						className={`${dm_sans.className} text-cornsilk/70 space-y-2`}
					>
						<p className="flex items-center gap-2">
							<span className="w-2 h-2 bg-green-400 rounded-full group-hover:animate-pulse"></span>
							Duration: {Math.round(recording.duration)}s
						</p>
						<p>
							Created:{" "}
							{new Date(recording.createdAt).toLocaleDateString()}
						</p>
					</div>
				</Link>
			))}
		</div>
	);
}
