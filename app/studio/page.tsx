import { StudioHeader } from "@/components/studio/StudioHeader";
import { StudioContent } from "@/components/studio/StudioContent";
import { adminAuth } from "@/lib/firebase/admin";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getFirestore } from "firebase-admin/firestore";
import { StoredRecording } from "@/types/voice-types";
import Link from "next/link";

// Add this metadata export to disable caching
export const dynamic = "force-dynamic";

// Server-side authentication check
export default async function Studio() {
	const sessionCookie = (await cookies()).get("session")?.value;

	if (!sessionCookie) {
		redirect("/");
	}

	try {
		// Verify the session cookie and get the user
		const decodedClaims = await adminAuth.verifySessionCookie(
			sessionCookie,
			true
		);
		if (!decodedClaims) {
			redirect("/");
		}

		// Fetch user's recordings from Firestore
		const db = getFirestore();
		const recordingsSnapshot = await db
			.collection("users")
			.doc(decodedClaims.uid)
			.collection("stored_recordings")
			.orderBy("createdAt", "desc")
			.get();

		const recordings: StoredRecording[] = recordingsSnapshot.docs.map(
			(doc) =>
				({
					...doc.data(),
					createdAt: doc.data().createdAt.toDate(),
				} as StoredRecording)
		);

		return (
			<div className="min-h-screen bg-black p-4">
				<div className="max-w-7xl mx-auto">
					<StudioHeader />
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
						{recordings.map((recording, index) => (
							<Link
								key={index}
								href={`/studio/playback?id=${recordingsSnapshot.docs[index].id}`}
								className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-colors cursor-pointer block"
							>
								<h3 className="text-xl font-semibold text-white mb-2">
									{recording.title}
								</h3>
								<div className="text-gray-400 text-sm">
									<p>
										Duration:{" "}
										{Math.round(recording.duration)}s
									</p>
									<p>
										Created:{" "}
										{recording.createdAt.toLocaleDateString()}
									</p>
								</div>
							</Link>
						))}
					</div>
					<div className="mt-8">
						<StudioContent />
					</div>
				</div>
			</div>
		);
	} catch (error) {
		// If there's an error verifying the session cookie, redirect to home
		redirect("/");
	}
}
