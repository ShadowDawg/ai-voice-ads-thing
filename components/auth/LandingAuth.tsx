"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createOrUpdateUser } from "@/lib/services/userService";

export function LandingAuth() {
	const { user, signInWithGoogle, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		const checkSession = async () => {
			if (user) {
				try {
					// Wait for Firebase to initialize fully
					await new Promise((resolve) => setTimeout(resolve, 1000));

					const idToken = await user.getIdToken(true); // Force refresh the token

					const response = await fetch("/api/auth/session", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ idToken }),
					});

					if (response.ok) {
						router.push("/home");
					} else {
						console.error(
							"Failed to create session:",
							await response.text()
						);
					}
				} catch (error) {
					console.error("Error in session check:", error);
				}
			}
		};

		checkSession();
	}, [user, router]);

	const handleGetStarted = async () => {
		try {
			if (loading) return;

			const userCredential = await signInWithGoogle();
			if (!userCredential?.user) {
				throw new Error("Sign in failed - no user data received");
			}

			// Wait for auth state to be fully updated
			await new Promise((resolve) => setTimeout(resolve, 1000));

			await createOrUpdateUser(userCredential.user);
		} catch (error) {
			console.error("Error signing in:", error);
			// Add error handling UI here
		}
	};

	return (
		<div className="flex gap-4">
			<Button
				size="lg"
				className="bg-cornsilk text-eerieBlack mt-6 hover:bg-cornsilk/90"
				onClick={handleGetStarted}
				disabled={loading}
			>
				{loading ? "Loading..." : "Get Started"}
			</Button>
		</div>
	);
}
