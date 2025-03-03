import { adminAuth } from "@/lib/firebase/admin";
import { getFirestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const userId = searchParams.get("userId");
	const page = parseInt(searchParams.get("page") || "1");
	const limit = parseInt(searchParams.get("limit") || "6");

	// Ensure Firebase is initialized by referencing adminAuth
	console.log("Firebase Admin initialized:", !!adminAuth);

	if (!userId) {
		return NextResponse.json(
			{ error: "User ID is required" },
			{ status: 400 }
		);
	}

	// Validate pagination parameters
	if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
		return NextResponse.json(
			{ error: "Invalid pagination parameters" },
			{ status: 400 }
		);
	}

	try {
		const db = getFirestore();
		const userRecordingsRef = db
			.collection("users")
			.doc(userId)
			.collection("stored_recordings");

		// First, get the total count of recordings
		const countSnapshot = await userRecordingsRef.count().get();
		const totalCount = countSnapshot.data().count;

		// Then get the paginated data
		const recordingsSnapshot = await userRecordingsRef
			.orderBy("createdAt", "desc")
			.limit(limit)
			.offset((page - 1) * limit)
			.get();

		const recordings = recordingsSnapshot.docs.map((doc) => ({
			docId: doc.id,
			...doc.data(),
			createdAt: doc.data().createdAt.toDate(),
		}));

		// Return both the recordings and the total count
		return NextResponse.json({
			recordings,
			totalCount,
		});
	} catch (error) {
		console.error("Error fetching recordings:", error);
		return NextResponse.json(
			{ error: "Failed to fetch recordings" },
			{ status: 500 }
		);
	}
}
