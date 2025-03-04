"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/app/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react"; // Import icons
import { dm_sans, dm_serif } from "@/lib/fonts/fonts";
import posthog from "posthog-js";

export function HomeHeader() {
	const { logout, user } = useAuth();

	// Cache the user profile data
	const { data: userProfile } = useQuery({
		queryKey: ["userProfile", user?.uid],
		queryFn: () => ({
			photoURL: user?.photoURL,
			displayName: user?.displayName,
			email: user?.email,
		}),
		enabled: !!user,
		staleTime: Infinity, // Data will never be considered stale during session
		gcTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
	});

	// Get initials from display name or email
	const getInitials = () => {
		if (userProfile?.displayName) {
			return userProfile.displayName
				.split(" ")
				.map((name) => name[0])
				.join("")
				.toUpperCase()
				.slice(0, 2);
		}
		return userProfile?.email?.[0].toUpperCase() || "?";
	};

	const handleLogout = async () => {
		try {
			// Reset PostHog identification
			posthog.reset();

			await logout();
			await fetch("/api/auth/logout", {
				method: "POST",
			});
			window.location.href = "/";
		} catch (error) {
			console.error("Error logging out:", error);
		}
	};

	return (
		<div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 mb-4 sm:mb-8">
			<h1
				className={`${dm_serif.className} text-vivid text-3xl sm:text-4xl md:text-5xl font-bold text-center sm:text-left`}
			>
				Addie Home
			</h1>
			<DropdownMenu>
				<DropdownMenuTrigger className="focus:outline-none" asChild>
					<Avatar className="h-8 w-8 cursor-pointer hover:opacity-80">
						{userProfile?.photoURL ? (
							<AvatarImage
								src={userProfile.photoURL}
								alt={
									userProfile.displayName ||
									userProfile.email ||
									"User"
								}
								referrerPolicy="no-referrer"
							/>
						) : null}
						<AvatarFallback>{getInitials()}</AvatarFallback>
					</Avatar>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="end"
					className="w-56 bg-[#282828] border-[#404040] text-white"
				>
					<DropdownMenuItem className="flex items-center gap-2 focus:bg-[#333333] cursor-pointer">
						<User className="h-4 w-4" />
						<span>
							{userProfile?.displayName || userProfile?.email}
						</span>
					</DropdownMenuItem>
					<DropdownMenuItem
						className="flex items-center gap-2 focus:bg-[#333333] text-red-400 cursor-pointer"
						onClick={handleLogout}
					>
						<LogOut className="h-4 w-4" />
						<span>Sign Out</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
