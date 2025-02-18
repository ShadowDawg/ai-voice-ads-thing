// app/page.tsx
import { LandingAuth } from "@/components/auth/LandingAuth";
import localFont from "next/font/local";
import Link from "next/link";

const andulka = localFont({ src: "../public/fonts/andulka.otf" });

export default function Home() {
	return (
		<div className="min-h-screen bg-black">
			<main className="flex min-h-screen flex-col items-center justify-center">
				<div className="container flex flex-col items-center text-center">
					<h1
						className={`${andulka.className} text-4xl font-bold sm:text-5xl md:text-8xl lg:text-9xl text-cornsilk tracking-normal`}
					>
						Addie
					</h1>
					<p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl text-eerieBlack">
						Create beautiful voice ads for podcasts and radio in
						minutes.
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
