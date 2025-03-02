import AuthForm from "./AuthForm";
import { dm_serif, dm_sans } from "@/lib/fonts/fonts";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebase/admin";

export default async function AuthPage() {
	// Check session cookie on the server
	const sessionCookie = (await cookies()).get("session")?.value;

	if (sessionCookie) {
		try {
			// Verify the session cookie on the server
			const decodedClaims = await adminAuth.verifySessionCookie(
				sessionCookie,
				true
			);
			if (decodedClaims) {
				// The user is already authenticated, so redirect to home
				console.log(
					"User is already authenticated, redirecting to home"
				);
				// redirect("/home");
			}
		} catch (error) {
			// Invalid session cookie, let the user see the auth form
		}
	}

	return (
		<div className="min-h-screen flex bg-black">
			{/* Left Section */}
			<div className="hidden lg:flex w-1/2 bg-black items-center justify-center p-12 rounded-3xl m-8">
				<div className="max-w-lg">
					<div className="flex items-center space-x-3 mb-16">
						{/* <span
							className={`${dm_serif.className} text-vivid text-6xl font-semibold`}
						>
							Addie
						</span> */}
						<span
							className={`${dm_serif.className} text-vivid text-6xl font-semibold`}
						>
							Beautifully simple.
						</span>
					</div>
					{/* You can add more content here like features, testimonials, etc. */}
				</div>
			</div>

			{/* Right Section */}
			<div className="flex-1 flex items-center justify-center p-8 bg-black">
				<div className="w-full max-w-md space-y-8 bg-prim p-8 rounded-3xl">
					{/* Header */}
					<div className="space-y-2">
						<h1 className="text-3xl font-semibold tracking-tight text-cornsilk text-center font-dm-sans">
							Get started
						</h1>
						{/* <p className="text-gray-400">
							Enter your email below to create your account
						</p> */}
					</div>

					{/* Auth Form Component */}
					<AuthForm />

					{/* Terms of Service */}
					<p className="text-sm text-gray-400 text-center">
						By continuing, you agree to our{" "}
						<a href="/terms" className="underline hover:text-white">
							Terms of Service
						</a>{" "}
						and{" "}
						<a
							href="/privacy"
							className="underline hover:text-white"
						>
							Privacy Policy
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}
