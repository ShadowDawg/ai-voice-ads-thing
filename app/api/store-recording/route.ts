import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { adminAuth } from "@/lib/firebase/admin";
import { StoredRecording, VoiceLineForPlayback } from "@/types/voice-types";

const db = getFirestore();

export async function POST(request: Request) {
	try {
		// Get the authorization token from the request headers
		const authHeader = request.headers.get("authorization");
		if (!authHeader?.startsWith("Bearer ")) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const token = authHeader.split("Bearer ")[1];

		// Verify the token and get the user
		const decodedToken = await adminAuth.verifyIdToken(token);
		const userId = decodedToken.uid;

		// Get the recording data from the request
		const { voiceLines, silenceLine, duration, speakers, script, title } =
			await request.json();

		// Format the data according to StoredRecording type
		console.log("In store recording...");
		console.log(script);
		const recordingData: StoredRecording = {
			voiceLines: voiceLines.map(
				(line: any, index: number): VoiceLineForPlayback => ({
					text: script.lines[index].line,
					role: script.lines[index].role,
					voiceId:
						speakers.find(
							(s: { role: any }) =>
								s.role === script.lines[index].role
						)?.voiceId || "",
					response: line,
				})
			),
			silenceLine: silenceLine,
			duration,
			createdAt: new Date(),
			title: title,
		};

		// Create a new document in the user's stored_recordings collection
		const recordingRef = db
			.collection("users")
			.doc(userId)
			.collection("stored_recordings")
			.doc();

		await recordingRef.set(recordingData);

		return NextResponse.json({
			id: recordingRef.id,
			...recordingData,
		});
	} catch (error) {
		console.error("Error storing recording:", error);
		return NextResponse.json(
			{ error: "Failed to store recording" },
			{ status: 500 }
		);
	}
}
