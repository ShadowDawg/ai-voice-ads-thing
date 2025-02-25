"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { dm_sans } from "@/lib/fonts/fonts";

export function HomeContent() {
	const router = useRouter();

	return (
		<div className="flex flex-col gap-6">
			<Button
				onClick={() => router.push("/studio")}
				className={`${dm_sans.className} bg-vivid text-black hover:bg-vivd/80 w-fit`}
			>
				New Recording
			</Button>
		</div>
	);
}
