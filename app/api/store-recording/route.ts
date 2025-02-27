import { NextResponse } from "next/server";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
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

		// Get the request body as text first for logging
		const requestText = await request.text();
		console.log("Raw request body:", requestText);

		// Parse the JSON manually
		let requestData;
		try {
			requestData = JSON.parse(requestText);
		} catch (e) {
			console.error("Error parsing JSON:", e);
			return NextResponse.json(
				{ error: "Invalid JSON in request body" },
				{ status: 400 }
			);
		}

		// Log each property individually
		console.log(
			"voiceLines:",
			requestData.voiceLines ? "present" : "missing"
		);
		console.log(
			"silenceLine:",
			requestData.silenceLine ? "present" : "missing"
		);
		console.log("duration:", requestData.duration);
		console.log("speakers:", requestData.speakers ? "present" : "missing");
		console.log("script:", requestData.script);
		console.log("title:", requestData.title);

		// Destructure with defaults
		const { voiceLines, silenceLine, duration, speakers, script, title } =
			requestData;

		// Format the data according to StoredRecording type
		console.log("In store recording...");
		console.log("Script structure:", script);

		// Check if script.lines exists and is an array
		if (!script || !script.lines || !Array.isArray(script.lines)) {
			console.error("Invalid script structure:", script);
			return NextResponse.json(
				{ error: "Invalid script structure" },
				{ status: 400 }
			);
		}

		// Check if voiceLines is an array
		if (!voiceLines || !Array.isArray(voiceLines)) {
			console.error("Invalid voiceLines structure:", voiceLines);
			return NextResponse.json(
				{ error: "Invalid voiceLines structure" },
				{ status: 400 }
			);
		}

		// Log the length of arrays
		console.log("voiceLines length:", voiceLines.length);
		console.log("script.lines length:", script.lines.length);

		// Log details about a sample voice line
		if (voiceLines && voiceLines.length > 0) {
			console.log(
				"Sample voice line structure:",
				JSON.stringify({
					keys: Object.keys(voiceLines[0]),
					hasArrayBuffer: voiceLines[0] instanceof ArrayBuffer,
					hasUint8Array: voiceLines[0] instanceof Uint8Array,
					typeofResponse: typeof voiceLines[0],
					prototypeChain: Object.getPrototypeOf(voiceLines[0])
						?.constructor?.name,
				})
			);
		}

		try {
			const recordingData: StoredRecording = {
				voiceLines: voiceLines.map(
					(line: any, index: number): VoiceLineForPlayback => {
						// Check if script.lines[index] exists
						if (!script.lines[index]) {
							console.error(
								`Missing script line at index ${index}`
							);
							throw new Error(
								`Missing script line at index ${index}`
							);
						}

						// If line is binary data, convert it to a base64 string or a format Firestore can handle
						let processedResponse;
						if (
							line instanceof ArrayBuffer ||
							line instanceof Uint8Array
						) {
							// Convert binary data to base64 string
							const uint8Array =
								line instanceof ArrayBuffer
									? new Uint8Array(line)
									: line;
							const binaryString = Array.from(uint8Array)
								.map((byte) => String.fromCharCode(byte))
								.join("");
							processedResponse = {
								type: "base64",
								data: btoa(binaryString),
							};
							console.log("Converted binary data to base64");
						} else if (typeof line === "object" && line !== null) {
							// Make a clean copy of the object to avoid potential issues
							processedResponse = JSON.parse(
								JSON.stringify(line)
							);
							console.log("Cloned object for safe storage");
						} else {
							processedResponse = line;
						}

						return {
							text: script.lines[index].line,
							role: script.lines[index].role,
							voiceId:
								speakers.find(
									(s: { role: any }) =>
										s.role === script.lines[index].role
								)?.voiceId || "",
							response: processedResponse,
						};
					}
				),
				silenceLine: silenceLine
					? JSON.parse(JSON.stringify(silenceLine))
					: null,
				duration,
				createdAt: Timestamp.now(),
				title: title,
			};

			// Log the data before sending to Firestore
			console.log("About to save recordingData structure");

			// Create a new document in the user's stored_recordings collection
			console.log("userId:", userId);
			const recordingRef = db
				.collection("users")
				.doc(userId)
				.collection("stored_recordings")
				.doc();

			// Deep inspection of recordingData before saving
			console.log("recordingData structure check:");
			console.log(
				"- voiceLines length:",
				recordingData.voiceLines?.length || "missing"
			);
			console.log(
				"- silenceLine:",
				recordingData.silenceLine ? "present" : "null/undefined"
			);
			console.log("- duration:", recordingData.duration);
			console.log(
				"- createdAt type:",
				recordingData.createdAt
					? recordingData.createdAt.constructor.name
					: "null/undefined"
			);
			console.log("- title:", recordingData.title);

			// Check for potentially problematic values in response field
			const problemFields = recordingData.voiceLines?.map((line, i) => {
				return {
					index: i,
					nullResponse: line.response === null,
					undefinedResponse: line.response === undefined,
					responseType: line.response
						? typeof line.response
						: "null/undefined",
					responseConstructor: line.response
						? line.response.constructor?.name
						: "N/A",
				};
			});
			console.log(
				"Voice line inspection:",
				JSON.stringify(problemFields, null, 2)
			);

			// Try stringifying to check for circular references
			try {
				JSON.stringify(recordingData);
				console.log("recordingData is JSON serializable");
			} catch (e) {
				console.error(
					"recordingData has circular references or non-serializable values:",
					e
				);
			}

			console.log("About to call recordingRef.set()");
			await recordingRef.set(recordingData);
			console.log("Successfully saved to Firestore");

			console.log("recordingRef:", recordingRef);

			return NextResponse.json({
				id: recordingRef.id,
				...recordingData,
			});
		} catch (error: unknown) {
			console.error("Error creating recordingData:", error);
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			return NextResponse.json(
				{ error: "Failed to process recording data: " + errorMessage },
				{ status: 500 }
			);
		}
	} catch (error: unknown) {
		console.error("Error storing recording:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ error: "Failed to store recording: " + errorMessage },
			{ status: 500 }
		);
	}
}
