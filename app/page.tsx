// app/page.tsx
import { LandingAuth } from "@/components/auth/LandingAuth";
import Link from "next/link";
import { dm_serif, dm_sans } from "@/lib/fonts/fonts";
import PlaybackDemo from "@/components/landing/demo/PlaybackDemo";
import { demoRecordingData } from "@/components/landing/demo/demo-recording";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { JoinWaitlist } from "@/components/waitlist/JoinWaitlist";

export default function Home() {
	return (
		<div className="bg-black px-6 sm:px-10 md:px-16 lg:px-24">
			{/* Shiro title centered at the top */}
			<div className="w-full flex justify-center pt-8 pb-2">
				<h1
					className={`${dm_serif.className} text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-vivid tracking-normal`}
				>
					Shiro
				</h1>
			</div>

			<main>
				{/* Hero Section */}
				<section className="flex flex-col md:flex-row items-center justify-between min-h-[80vh] py-6 sm:h-screen">
					<div className="flex flex-col items-center md:items-start text-center md:text-left mb-6 md:mb-0 md:max-w-[50%]">
						<p
							className={`${dm_sans.className} text-3xl sm:text-3xl md:text-4xl lg:text-7xl text-sec/50 mb-8 sm:mb-12`}
						>
							Your{" "}
							<span className="text-sec">
								executive assistant
							</span>{" "}
							powered by <span className="text-sec">ai</span>
						</p>
						<div className="mb-10 sm:mb-16 w-full">
							<JoinWaitlist />
						</div>
					</div>
					<div className="md:max-w-[45%] w-full">
						<Image
							src="/image.png"
							alt="Shiro AI Assistant"
							width={600}
							height={600}
							className="w-full h-auto rounded-3xl border-4 border-purple-950"
							priority
						/>
					</div>
				</section>
			</main>
		</div>
	);
}
