import { adminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

export async function POST(request: Request) {
	try {
		const { idToken } = await request.json();

		// Create session cookie
		const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
		const sessionCookie = await adminAuth.createSessionCookie(idToken, {
			expiresIn,
		});

		// Set the session cookie
		(
			await // Set the session cookie
			cookies()
		).set("session", sessionCookie, {
			maxAge: expiresIn,
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			path: "/",
		});

		return Response.json({ success: true });
	} catch (error) {
		return Response.json(
			{ error: "Failed to create session" },
			{ status: 401 }
		);
	}
}
