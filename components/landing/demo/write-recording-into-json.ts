const { getFirestore } = require("firebase-admin/firestore");
const { initializeApp, cert } = require("firebase-admin/app");
const fs = require("fs");
const path = require("path");

// Initialize Firebase Admin SDK
// You'll need to create a service account key file from Firebase console
const serviceAccount = require("../../../serviceAccountKey.json");

// Check if app is already initialized
try {
	initializeApp({
		credential: cert(serviceAccount),
	});
} catch (error) {
	// App already initialized, continue
}

const db = getFirestore();

async function fetchRecording(userId: string, docId: string): Promise<void> {
	try {
		console.log(
			`Fetching recording for user ${userId}, document ${docId}...`
		);

		// Reference to the specific recording document
		const recordingRef = db
			.collection("users")
			.doc(userId)
			.collection("stored_recordings")
			.doc(docId);

		// Get the document
		const recordingDoc = await recordingRef.get();

		if (!recordingDoc.exists) {
			console.error(
				`Recording with ID ${docId} not found for user ${userId}`
			);
			process.exit(1);
		}

		// Get the data
		const recordingData = recordingDoc.data();
		console.log(
			`Successfully retrieved recording: ${
				recordingData?.title || "Untitled"
			}`
		);

		// Create output directory if it doesn't exist
		const outputDir = path.join(
			process.cwd(),
			"/components/landing/demo/example_recordings"
		);
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true });
		}

		// Write to file
		const outputPath = path.join(
			outputDir,
			`recording-${userId}-${docId}.json`
		);
		fs.writeFileSync(outputPath, JSON.stringify(recordingData, null, 2));

		console.log(`Recording saved to ${outputPath}`);
	} catch (error) {
		console.error("Error fetching recording:", error);
		process.exit(1);
	}
}

// Check if userId and docId are provided as command line arguments
if (process.argv.length < 4) {
	console.error("Usage: ts-node fetch-recording.ts <userId> <docId>");
	process.exit(1);
}

const userId = process.argv[2];
const docId = process.argv[3];

fetchRecording(userId, docId)
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("Unhandled error:", error);
		process.exit(1);
	});
