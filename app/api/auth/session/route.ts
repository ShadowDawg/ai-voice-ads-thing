import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

export async function POST(request: Request) {
	try {
		const { idToken } = await request.json();
		console.log("Session route received idToken:", idToken);

		// 5 days in milliseconds
		const expiresIn = 60 * 60 * 24 * 5 * 1000;
		const sessionCookie = await adminAuth.createSessionCookie(idToken, {
			expiresIn,
		});

		// Create response using NextResponse so that cookie settings work properly
		const response = NextResponse.json({ success: true });

		// Convert expiresIn to seconds for the cookie's maxAge option and add sameSite for extra security.
		response.cookies.set("session", sessionCookie, {
			maxAge: expiresIn / 1000,
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			path: "/",
			sameSite: "lax",
		});

		return response;
	} catch (error: any) {
		console.error("Error creating session:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to create session" },
			{ status: 401 }
		);
	}
}
