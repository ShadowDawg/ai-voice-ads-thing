"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { usePostHog } from "posthog-js/react";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

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

	return <PHProvider client={posthog}>{children}</PHProvider>;
}

function PostHogPageView() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const posthog = usePostHog();

	// Track pageviews
	useEffect(() => {
		if (pathname && posthog) {
			let url = window.origin + pathname;
			if (searchParams.toString()) {
				url = url + "?" + searchParams.toString();
			}

			posthog.capture("$pageview", { $current_url: url });
		}
	}, [pathname, searchParams, posthog]);

	return null;
}

// Wrap PostHogPageView in Suspense to avoid the useSearchParams usage above
// from de-opting the whole app into client-side rendering
// See: https://nextjs.org/docs/messages/deopted-into-client-rendering
function SuspendedPostHogPageView() {
	return (
		<Suspense fallback={null}>
			<PostHogPageView />
		</Suspense>
	);
}

// manually capture events
// posthog.capture('my event', { property: 'value' })
