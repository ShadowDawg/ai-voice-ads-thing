// app/page.tsx
import { LandingAuth } from "@/components/auth/LandingAuth";
import Link from "next/link";
import { dm_serif, dm_sans } from "@/lib/fonts/fonts";

export default function Home() {
	return (
		<div className="min-h-screen bg-black">
			<main className="flex min-h-screen flex-col items-center justify-center">
				<div className="container flex flex-col items-center text-center">
					<h1
						className={`${dm_serif.className} text-4xl sm:text-5xl md:text-8xl lg:text-9xl text-vivid tracking-normal`}
					>
						Addie
					</h1>
					<p
						className={`${dm_sans.className} max-w-[700px] text-2xl sm:text-2xl md:text-3xl lg:text-4xl text-sec/50`}
					>
						Create{" "}
						<span className="text-sec">beautiful voice ads</span>{" "}
						for podcasts and radio{" "}
						<span className="text-sec">in minutes</span>
					</p>
					<Link
						href="/auth"
						className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-white hover:bg-primary/90"
					>
						Get Started
					</Link>
				</div>
			</main>
		</div>
	);
}
