import { cookies } from "next/headers";

export async function POST() {
	// Clear the session cookie
	(
		await // Clear the session cookie
		cookies()
	).delete("session");

	return Response.json({ success: true });
}
