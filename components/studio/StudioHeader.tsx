"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/context/AuthContext";

export function StudioHeader() {
	const { logout } = useAuth();

	const handleLogout = async () => {
		try {
			await logout();
			// Add cookie clearing request
			await fetch("/api/auth/logout", {
				method: "POST",
			});
			// Optionally, force a page refresh to clear any cached state
			window.location.href = "/";
		} catch (error) {
			console.error("Error logging out:", error);
			// Add error handling UI
		}
	};

	return (
		<div className="flex justify-between items-center mb-8">
			<h1 className="text-white text-3xl font-bold tracking-tight">
				Addie Studio
			</h1>
			<Button
				onClick={handleLogout}
				variant="outline"
				className="bg-[#282828] text-white border-[#404040] hover:bg-[#333333] hover:border-[#505050]"
			>
				Sign Out
			</Button>
		</div>
	);
}
