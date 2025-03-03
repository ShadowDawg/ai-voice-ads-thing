"use client";

import { useQuery } from "@tanstack/react-query";
import { StoredRecording } from "@/types/voice-types";
import Link from "next/link";
import { dm_serif, dm_sans } from "@/lib/fonts/fonts";
import { useState } from "react";

// Add interface to include the document ID
interface RecordingWithId extends StoredRecording {
	docId: string;
}

async function fetchRecordings(
	userId: string,
	page: number = 1,
	limit: number = 6
): Promise<{
	recordings: RecordingWithId[];
	totalCount: number;
}> {
	const response = await fetch(
		`/api/recordings?userId=${userId}&page=${page}&limit=${limit}`
	);
	if (!response.ok) {
		throw new Error("Network response was not ok");
	}
	return response.json();
}

export function RecordingsList({ userId }: { userId: string }) {
	const [currentPage, setCurrentPage] = useState(1);
	const [lastKnownTotalPages, setLastKnownTotalPages] = useState(1);
	const ITEMS_PER_PAGE = 6;

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ["recordings", userId, currentPage, ITEMS_PER_PAGE],
		queryFn: () => fetchRecordings(userId, currentPage, ITEMS_PER_PAGE),
	});

	const recordings = data?.recordings || [];
	const totalPages = data?.totalCount
		? Math.ceil(data.totalCount / ITEMS_PER_PAGE)
		: 0;

	// Update the last known total pages whenever we get valid data
	if (totalPages > 0 && !isLoading && totalPages !== lastKnownTotalPages) {
		setLastKnownTotalPages(totalPages);
	}

	const handlePrevPage = () => {
		if (currentPage > 1) {
			setCurrentPage((prev) => prev - 1);
		}
	};

	const handleNextPage = () => {
		if (currentPage < (isLoading ? lastKnownTotalPages : totalPages)) {
			setCurrentPage((prev) => prev + 1);
		}
	};

	// Keep track of whether we should show pagination controls
	const showPagination = isLoading || totalPages > 0;

	// Use lastKnownTotalPages during loading to prevent UI flicker
	const displayTotalPages = isLoading ? lastKnownTotalPages : totalPages || 1;

	return (
		<div className="space-y-4 sm:space-y-8 flex flex-col">
			<div className="flex-1 min-h-[300px] sm:min-h-[400px]">
				{isError ? (
					<div className="text-red-400 text-center font-medium h-full flex items-center justify-center p-4">
						Error loading recordings:{" "}
						{error instanceof Error
							? error.message
							: "Unknown error"}
					</div>
				) : isLoading ? (
					<div className="h-full flex items-center justify-center">
						<div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-cornsilk" />
					</div>
				) : !recordings?.length ? (
					<div className="text-cornsilk/80 text-center italic h-full flex items-center justify-center p-4">
						No recordings yet. Create your first one!
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
						{recordings.map((recording) => (
							<Link
								key={recording.docId}
								href={`/studio/playback?id=${recording.docId}`}
								className="bg-prim/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:bg-black/40 transition-all hover:scale-[1.02] cursor-pointer block border border-cornsilk/10 group"
							>
								<h3
									className={`${dm_serif.className} text-xl sm:text-2xl text-cornsilk mb-2 sm:mb-3`}
								>
									{recording.title}
								</h3>
								<div
									className={`${dm_sans.className} text-sm sm:text-base text-cornsilk/70 space-y-1 sm:space-y-2`}
								>
									<p className="flex items-center gap-2">
										<span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full group-hover:animate-pulse"></span>
										Duration:{" "}
										{Math.round(recording.duration)}s
									</p>
									<p>
										Created:{" "}
										{typeof recording.createdAt ===
											"object" &&
										recording.createdAt.toDate
											? recording.createdAt
													.toDate()
													.toLocaleDateString()
											: typeof recording.createdAt ===
													"object" &&
											  recording.createdAt.seconds
											? new Date(
													recording.createdAt
														.seconds * 1000
											  ).toLocaleDateString()
											: typeof recording.createdAt ===
											  "string"
											? new Date(
													recording.createdAt
											  ).toLocaleDateString()
											: "Unknown date"}
									</p>
								</div>
							</Link>
						))}
					</div>
				)}
			</div>

			{showPagination && (
				<div className="flex justify-center items-center gap-2 sm:gap-4 mt-auto pt-4">
					<button
						onClick={handlePrevPage}
						disabled={currentPage === 1 || isLoading}
						className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg border border-cornsilk/20 ${
							currentPage === 1 || isLoading
								? "text-cornsilk/40 cursor-not-allowed"
								: "text-cornsilk hover:bg-prim/50 transition-colors"
						}`}
					>
						Previous
					</button>
					<span
						className={`${dm_sans.className} text-sm sm:text-base text-cornsilk`}
					>
						Page {currentPage} of {displayTotalPages}
					</span>
					<button
						onClick={handleNextPage}
						disabled={
							currentPage === displayTotalPages || isLoading
						}
						className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg border border-cornsilk/20 ${
							currentPage === displayTotalPages || isLoading
								? "text-cornsilk/40 cursor-not-allowed"
								: "text-cornsilk hover:bg-prim/50 transition-colors"
						}`}
					>
						Next
					</button>
				</div>
			)}
		</div>
	);
}
