"use client";

import { useState } from "react";
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

// Define the form schema
const signUpSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
});

type SignUpForm = z.infer<typeof signUpSchema>;

export default function AuthForm() {
	const [isSignUp, setIsSignUp] = useState(false);
	const router = useRouter();
	const { signInWithGoogle, loading } = useAuth();

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
			router.push("/studio");
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
			router.push("/studio");
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
			<div className="flex justify-center space-x-4">
				<button
					onClick={() => setIsSignUp(false)}
					className={`px-4 py-2 rounded-md transition-colors ${
						!isSignUp
							? "bg-primary text-white"
							: "text-muted-foreground hover:bg-gray-100"
					}`}
				>
					Login
				</button>
				<button
					onClick={() => setIsSignUp(true)}
					className={`px-4 py-2 rounded-md transition-colors ${
						isSignUp
							? "bg-primary text-white"
							: "text-muted-foreground hover:bg-gray-100"
					}`}
				>
					Sign Up
				</button>
			</div>

			{isSignUp ? (
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleGoogleSignUp)}
						className="space-y-4"
					>
						<FormField
							control={form.control}
							name="firstName"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											placeholder="First Name"
											{...field}
										/>
									</FormControl>
									<FormMessage />
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
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button
							type="submit"
							className="w-full h-11 bg-white border border-gray-300 hover:bg-gray-50 text-eerieBlack"
							disabled={loading}
						>
							<FcGoogle className="mr-2 h-5 w-5" />
							Sign up with Google
						</Button>
					</form>
				</Form>
			) : (
				<Button
					onClick={handleGoogleLogin}
					className="w-full h-11 bg-white border border-gray-300 hover:bg-gray-50 text-eerieBlack"
					disabled={loading}
				>
					<FcGoogle className="mr-2 h-5 w-5" />
					Login with Google
				</Button>
			)}
		</>
	);
}
