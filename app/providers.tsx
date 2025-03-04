"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { usePostHog } from "posthog-js/react";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import PostHogPageView from "./PostHogPageView";
import SuspendedPostHogPageView from "./PostHogPageView";
export function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
						gcTime: 10 * 60 * 1000, // Keep unused data in cache for 10 minutes
					},
				},
			})
	);

	return (
		<QueryClientProvider client={queryClient}>
			{children}
		</QueryClientProvider>
	);
}

// export function PostHogProvider({ children }: { children: React.ReactNode }) {
// 	useEffect(() => {
// 		posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
// 			api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
// 			ui_host: "https://us.posthog.com",
// 			person_profiles: "always", // or 'always' to create profiles for anonymous users as well
// 			capture_pageview: false, // Disable automatic pageview capture, as we capture manually
// 		});
// 	}, []);

// 	return (
// 		<PHProvider client={posthog}>
// 			<SuspendedPostHogPageView />
// 			{children}
// 		</PHProvider>
// 	);
// }

export function PostHogProvider({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
			api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
			capture_pageview: false, // Disable automatic pageview capture, as we capture manually
			person_profiles: "always", // or 'always' to create profiles for anonymous users as well
		});
	}, []);

	return (
		<PHProvider client={posthog}>
			<SuspendedPostHogPageView />
			{children}
		</PHProvider>
	);
}

// manually capture events
// posthog.capture('my event', { property: 'value' })
