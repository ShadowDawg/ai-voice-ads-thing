import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export async function POST(request: Request) {
	try {
		const { email } = await request.json();

		// Validate email
		if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return NextResponse.json(
				{ error: "Valid email is required" },
				{ status: 400 }
			);
		}

		// Add email to waitlist collection
		const waitlistRef = collection(db, "waitlist");
		await addDoc(waitlistRef, {
			email,
			createdAt: new Date().toISOString(),
		});

		return NextResponse.json({ success: true });
	} catch (error: any) {
		console.error("Error adding to waitlist:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to join waitlist" },
			{ status: 500 }
		);
	}
}
