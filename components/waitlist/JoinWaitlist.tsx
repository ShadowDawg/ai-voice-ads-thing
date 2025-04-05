"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { dm_sans } from "@/lib/fonts/fonts";

export function JoinWaitlist() {
	const [email, setEmail] = useState("");
	const [status, setStatus] = useState<
		"idle" | "loading" | "success" | "error"
	>("idle");
	const [message, setMessage] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			setStatus("error");
			setMessage("Please enter a valid email address");
			return;
		}

		try {
			setStatus("loading");
			const response = await fetch("/api/waitlist", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Something went wrong");
			}

			setStatus("success");
			setMessage("You've been added to the waitlist!");
			setEmail("");
		} catch (error: any) {
			setStatus("error");
			setMessage(error.message || "Failed to join waitlist");
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col sm:flex-row gap-4 w-full max-w-[500px]"
		>
			<div className="flex-grow">
				<input
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="Enter your email"
					className={`${dm_sans.className} w-full px-4 py-3 sm:py-3.5 rounded-full bg-white/10 border border-sec/30 text-white focus:outline-none focus:border-vivid`}
					disabled={status === "loading" || status === "success"}
				/>
				{(status === "error" || status === "success") && (
					<p
						className={`mt-2 text-sm ${
							status === "error"
								? "text-red-400"
								: "text-green-400"
						}`}
					>
						{message}
					</p>
				)}
			</div>
			<Button
				type="submit"
				className="px-6 py-3 sm:py-0 h-12 sm:h-14 rounded-full bg-vivid hover:bg-vivid hover:scale-105 transition-all text-black font-medium"
				disabled={status === "loading" || status === "success"}
			>
				{status === "loading"
					? "Joining..."
					: status === "success"
					? "Joined!"
					: "Join Waitlist"}
			</Button>
		</form>
	);
}
