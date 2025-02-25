import { HomeHeader } from "@/app/home/components/HomeHeader";
import { HomeContent } from "@/app/home/components/NewRecording";
import { adminAuth } from "@/lib/firebase/admin";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getFirestore } from "firebase-admin/firestore";
import { StoredRecording } from "@/types/voice-types";
import Link from "next/link";
import { RecordingsList } from "@/app/home/components/RecordingsList";
import { dm_serif, dm_sans } from "@/lib/fonts/fonts";

// Add this metadata export to disable caching
export const dynamic = "force-dynamic";

// Server-side authentication check
export default async function Studio() {
	console.time("total-page-load");

	console.time("session-verification");
	const sessionCookie = (await cookies()).get("session")?.value;
	if (!sessionCookie) {
		redirect("/");
	}

	try {
		const decodedClaims = await adminAuth.verifySessionCookie(
			sessionCookie,
			true
		);
		console.timeEnd("session-verification");

		if (!decodedClaims) {
			redirect("/");
		}

		console.timeEnd("total-page-load");

		return (
			<div className="min-h-screen bg-black p-8">
				<div className="max-w-7xl mx-auto space-y-12">
					<div className="p-8">
						<HomeHeader />
					</div>

					<div className="flex justify-center my-12">
						<HomeContent />
					</div>

					<div className="bg-black rounded-3xl p-8">
						<h2
							className={`${dm_sans.className} text-cornsilk text-3xl mb-8`}
						>
							Your Recordings
						</h2>
						<RecordingsList userId={decodedClaims.uid} />
					</div>
				</div>
			</div>
		);
	} catch (error) {
		// If there's an error verifying the session cookie, redirect to home
		redirect("/");
	}
}
