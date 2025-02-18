"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function StudioContent() {
	const { user, loading } = useAuth();
	const router = useRouter();

	// Additional client-side protection
	useEffect(() => {
		if (!user && !loading) {
			router.push("/");
		}
	}, [user, loading, router]);

	if (loading) {
		return (
			<div className="flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<Button
				onClick={() => router.push("/studio/new")}
				className="bg-cornsilk text-black hover:bg-cornsilk/80 w-fit"
			>
				New Recording
			</Button>
		</div>
	);
}
