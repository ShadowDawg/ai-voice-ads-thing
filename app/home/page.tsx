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
	// Use unique labels for each timing instance
	const pageLoadLabel = `total-page-load-${Date.now()}`;
	const sessionVerificationLabel = `session-verification-${Date.now()}`;

	console.time(pageLoadLabel);
	console.time(sessionVerificationLabel);

	// Debugging: Log the full cookie object so you can see if it's present or not
	const sessionCookie = (await cookies()).get("session")?.value;
	console.log("Home page session cookie object:", sessionCookie);

	if (!sessionCookie) {
		console.log("No valid session cookie found — redirecting to /");
		redirect("/");
	}

	try {
		const decodedClaims = await adminAuth.verifySessionCookie(
			sessionCookie,
			true
		);
		console.timeEnd(sessionVerificationLabel);

		if (!decodedClaims) {
			redirect("/");
		}

		console.timeEnd(pageLoadLabel);

		return (
			<div className="min-h-screen bg-black px-4 py-6 sm:p-8">
				<div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
					<div className="p-4 sm:p-8">
						<HomeHeader />
					</div>

					<div className="flex justify-center my-6 sm:my-12">
						<HomeContent />
					</div>

					<div className="bg-black rounded-xl sm:rounded-3xl p-4 sm:p-8">
						<h2
							className={`${dm_sans.className} text-cornsilk text-2xl sm:text-3xl mb-4 sm:mb-8`}
						>
							Your Recordings
						</h2>
						<RecordingsList userId={decodedClaims.uid} />
					</div>
				</div>
			</div>
		);
	} catch (error) {
		// Make sure to end timers even in error case
		console.timeEnd(sessionVerificationLabel);
		console.timeEnd(pageLoadLabel);
		// If there's an error verifying the session cookie, redirect to home
		redirect("/");
	}
}
