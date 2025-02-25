"use client";

import { useState, useEffect } from "react";
import { createOrUpdateUser } from "@/lib/services/userService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { dm_sans } from "@/lib/fonts/fonts";

// Define the form schema
const signUpSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
});

type SignUpForm = z.infer<typeof signUpSchema>;

export default function AuthForm() {
	const [isSignUp, setIsSignUp] = useState(true);
	const router = useRouter();
	const { user, signInWithGoogle, loading } = useAuth();

	// Client-side redirect if already signed in.
	// Note: Always rely on the secure, server-side cookie check for authentication.
	useEffect(() => {
		if (!loading && user) {
			router.push("/home");
		}
	}, [user, loading, router]);

	// Initialize form
	const form = useForm<SignUpForm>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
		},
	});

	const handleGoogleLogin = async () => {
		try {
			const userCredential = await signInWithGoogle();
			if (!userCredential?.user) {
				throw new Error("Sign in failed - no user data received");
			}

			// Get the ID token from the user
			const idToken = await userCredential.user.getIdToken();

			// Send the ID token to your backend to set the session cookie
			const response = await fetch("/api/auth/session", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ idToken }),
			});

			if (!response.ok) {
				throw new Error("Failed to create session");
			}

			// Only redirect after the session is set
			router.push("/home");
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Failed to sign in with Google. Please try again.",
			});
		}
	};

	const handleGoogleSignUp = async (data: SignUpForm) => {
		try {
			const userCredential = await signInWithGoogle();
			if (!userCredential?.user) {
				throw new Error("Sign in failed - no user data received");
			}

			// Get the ID token from the user
			const idToken = await userCredential.user.getIdToken();

			// Send the ID token to your backend to set the session cookie
			const response = await fetch("/api/auth/session", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ idToken }),
			});

			if (!response.ok) {
				throw new Error("Failed to create session");
			}

			// Check if the user is new
			const isNewUser =
				userCredential.user.metadata.creationTime ===
				userCredential.user.metadata.lastSignInTime;

			if (isNewUser) {
				await createOrUpdateUser({
					...userCredential.user,
					displayName: `${data.firstName} ${data.lastName}`,
				});
			}

			// Only redirect after the session is set
			router.push("/home");
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Failed to sign up with Google. Please try again.",
			});
		}
	};

	return (
		<>
			<div className="flex justify-center space-x-4 mb-8">
				<button
					onClick={() => setIsSignUp(true)}
					className={`${
						dm_sans.className
					} px-6 py-2.5 rounded-xl transition-all ${
						isSignUp
							? "bg-vivid text-black font-medium"
							: "text-gray-400 hover:text-cornsilk"
					}`}
				>
					Sign Up
				</button>
				<button
					onClick={() => setIsSignUp(false)}
					className={`${
						dm_sans.className
					} px-6 py-2.5 rounded-xl transition-all ${
						!isSignUp
							? "bg-vivid text-black font-medium"
							: "text-gray-400 hover:text-cornsilk"
					}`}
				>
					Login
				</button>
			</div>

			{isSignUp ? (
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleGoogleSignUp)}
						className="space-y-6"
					>
						<FormField
							control={form.control}
							name="firstName"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											placeholder="First Name"
											className="h-12 bg-neutral-800 border-neutral-700 text-cornsilk placeholder:text-gray-400 focus:border-vivid focus:ring-vivid rounded-xl"
											{...field}
										/>
									</FormControl>
									<FormMessage className="text-red-400" />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="lastName"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											placeholder="Last Name"
											className="h-12 bg-neutral-800 border-neutral-700 text-cornsilk placeholder:text-gray-400 focus:border-vivid focus:ring-vivid rounded-xl"
											{...field}
										/>
									</FormControl>
									<FormMessage className="text-red-400" />
								</FormItem>
							)}
						/>
						<Button
							type="submit"
							className={`${dm_sans.className} w-full h-12 bg-neutral-800 hover:bg-neutral-700 text-cornsilk border-neutral-700 rounded-xl transition-colors`}
							disabled={loading}
						>
							<FcGoogle className="mr-3 h-5 w-5" />
							Sign up with Google
						</Button>
					</form>
				</Form>
			) : (
				<Button
					onClick={handleGoogleLogin}
					className={`${dm_sans.className} w-full h-12 bg-neutral-800 hover:bg-neutral-700 text-cornsilk border-neutral-700 rounded-xl transition-colors`}
					disabled={loading}
				>
					<FcGoogle className="mr-3 h-5 w-5" />
					Login with Google
				</Button>
			)}
		</>
	);
}
