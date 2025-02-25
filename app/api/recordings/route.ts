import { adminAuth } from "@/lib/firebase/admin";
import { getFirestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const userId = searchParams.get("userId");

	if (!userId) {
		return NextResponse.json(
			{ error: "User ID is required" },
			{ status: 400 }
		);
	}

	try {
		const db = getFirestore();
		const recordingsSnapshot = await db
			.collection("users")
			.doc(userId)
			.collection("stored_recordings")
			.orderBy("createdAt", "desc")
			.get();

		const recordings = recordingsSnapshot.docs.map((doc) => ({
			docId: doc.id, // Include the document ID
			...doc.data(),
			createdAt: doc.data().createdAt.toDate(),
		}));

		return NextResponse.json(recordings);
	} catch (error) {
		console.error("Error fetching recordings:", error);
		return NextResponse.json(
			{ error: "Failed to fetch recordings" },
			{ status: 500 }
		);
	}
}
