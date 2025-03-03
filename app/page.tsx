// app/page.tsx
import { LandingAuth } from "@/components/auth/LandingAuth";
import Link from "next/link";
import { dm_serif, dm_sans } from "@/lib/fonts/fonts";
import PlaybackDemo from "@/components/landing/demo/PlaybackDemo";
import { demoRecordingData } from "@/components/landing/demo/demo-recording";
import { Button } from "@/components/ui/button";

export default function Home() {
	return (
		<div className="bg-black">
			<main>
				{/* Hero Section */}
				<section className="flex flex-col items-center justify-center text-center min-h-[90vh] px-4 py-10 sm:h-screen">
					<h1
						className={`${dm_serif.className} text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-vivid tracking-normal mb-6 sm:mb-10`}
					>
						Addie
					</h1>
					<p
						className={`${dm_sans.className} max-w-[1000px] text-xl sm:text-3xl md:text-4xl lg:text-7xl text-sec/50 mb-10 sm:mb-16`}
					>
						Create{" "}
						<span className="text-sec">beautiful voice ads</span>{" "}
						for podcasts and radio{" "}
						<span className="text-sec">in minutes</span>
					</p>
					<Button
						asChild
						size="lg"
						className="mb-10 sm:mb-16 px-8 sm:px-12 text-lg sm:text-2xl h-12 sm:h-14 rounded-full bg-vivid hover:bg-vivid hover:scale-105 transition-all text-black"
					>
						<Link href="/auth">Get Started</Link>
					</Button>
				</section>

				{/* How it works section */}
				<section className="py-12 md:py-24">
					<div className="container mx-auto px-4">
						<div className="text-center mb-8 md:mb-16">
							<h3
								className={`${dm_serif.className} text-2xl sm:text-3xl md:text-4xl lg:text-6xl text-white mb-6`}
							>
								Top-notch designs,
								<br className="hidden sm:block" />
								delivered at your doorstep.
							</h3>
						</div>

						{/* Cards container */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
							{/* Step 1 Card */}
							<div className="bg-black/40 border border-gray-800 rounded-xl md:rounded-3xl p-4 md:p-8 hover:border-vivid/30 transition-all flex flex-col">
								{/* Visual content area - Duration and Speakers Selection */}
								<div className="flex-1 flex flex-col items-center justify-center mb-4 md:mb-8 space-y-3 md:space-y-4">
									{/* Duration selection - horizontal scroll peek effect */}
									<div className="w-full relative">
										<div className="text-sm text-sec mb-2">
											Duration
										</div>
										<div className="flex space-x-2 overflow-hidden">
											{/* First option partially visible */}
											<div className="shrink-0 w-[30%] bg-zinc-900 text-white border border-zinc-800 rounded-lg p-2 text-center">
												<div className="font-semibold text-xs sm:text-sm md:text-base">
													15s
												</div>
											</div>
											{/* Middle options fully visible */}
											<div className="shrink-0 w-[30%] bg-[#fffbeb] text-black rounded-lg p-2 text-center">
												<div className="font-semibold text-xs sm:text-sm md:text-base">
													30s
												</div>
											</div>
											{/* Last option partially visible */}
											<div className="shrink-0 w-[30%] bg-zinc-900 text-white border border-zinc-800 rounded-lg p-2 text-center">
												<div className="font-semibold text-xs sm:text-sm md:text-base">
													45s
												</div>
											</div>
											<div className="shrink-0 w-[25%] bg-zinc-900 text-white border border-zinc-800 rounded-lg p-2 text-center">
												<div className="font-semibold text-xs sm:text-sm md:text-base">
													60s
												</div>
											</div>
										</div>
									</div>

									{/* Speakers selection - with peek effect */}
									<div className="w-full mt-3 md:mt-4">
										<div className="text-sm text-sec mb-2">
											Speakers
										</div>
										<div className="overflow-hidden">
											{/* Visible speakers row */}
											<div className="flex space-x-2 text-sec">
												<div className="shrink-0 w-[50%] border border-[#14a589] bg-black/60 rounded-lg p-2 flex items-center justify-between">
													<div className="flex items-center">
														<div className="w-2 h-2 sm:w-3 sm:h-3 bg-[#3bbfaf] rounded-full mr-1 sm:mr-2"></div>
														<span className="text-xs md:text-sm font-medium truncate">
															Male Narrator
														</span>
													</div>
													<svg
														viewBox="0 0 24 24"
														fill="currentColor"
														className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
													>
														<path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
													</svg>
												</div>
												<div className="shrink-0 w-[60%] border border-zinc-800 bg-black/60 rounded-lg p-2 flex items-center justify-between hover:border-zinc-600 transition-colors">
													<div className="flex items-center overflow-hidden">
														<div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full mr-1 sm:mr-2"></div>
														<span className="text-xs md:text-sm truncate">
															Female Narrator
														</span>
													</div>
													<svg
														viewBox="0 0 24 24"
														fill="currentColor"
														className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
													>
														<path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
													</svg>
												</div>
											</div>

											{/* Second speakers row (partially visible) */}
											<div className="flex space-x-2 mt-2 text-sec">
												<div className="shrink-0 w-[60%] border border-zinc-800 bg-black/60 rounded-lg p-2 flex items-center justify-between hover:border-zinc-600 transition-colors">
													<div className="flex items-center overflow-hidden">
														<div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full mr-1 sm:mr-2"></div>
														<span className="text-xs md:text-sm truncate">
															Young Woman
														</span>
													</div>
													<svg
														viewBox="0 0 24 24"
														fill="currentColor"
														className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
													>
														<path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
													</svg>
												</div>
												<div className="shrink-0 w-[60%] border border-zinc-800 bg-black/60 rounded-lg p-2 flex items-center justify-between hover:border-zinc-600 transition-colors">
													<div className="flex items-center overflow-hidden">
														<div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full mr-1 sm:mr-2 flex-shrink-0"></div>
														<span className="text-xs md:text-sm truncate">
															Young Man
														</span>
													</div>
													<svg
														viewBox="0 0 24 24"
														fill="currentColor"
														className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
													>
														<path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
													</svg>
												</div>
											</div>
										</div>
									</div>
								</div>

								{/* Text content at bottom */}
								<div>
									<h4
										className={`${dm_sans.className} text-lg sm:text-xl md:text-2xl text-white mb-2 md:mb-4`}
									>
										Tell us your vision
									</h4>
									<p
										className={`${dm_sans.className} text-sm sm:text-base md:text-lg text-sec`}
									>
										Choose ad duration and speakers that
										best suit your brand.
									</p>
								</div>
							</div>

							{/* Step 2 Card */}
							<div className="bg-black/40 border border-gray-800 rounded-xl md:rounded-3xl p-4 md:p-8 hover:border-vivid/30 transition-all flex flex-col">
								{/* Visual content area - Input description example */}
								<div className="flex-1 flex flex-col justify-center mb-4 md:mb-8">
									<div className="bg-black/60 border border-zinc-800 rounded-lg p-3 sm:p-4 text-white">
										<div className="flex items-start">
											<div className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-vivid/20 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2 sm:mr-3">
												<svg
													viewBox="0 0 24 24"
													className="w-2.5 h-2.5 md:w-4 md:h-4 text-vivid"
												>
													<path
														fill="currentColor"
														d="M12,2C6.47,2 2,6.47 2,12C2,17.53 6.47,22 12,22A10,10 0 0,0 22,12C22,6.47 17.53,2 12,2M15.1,7.07C15.24,7.07 15.38,7.12 15.5,7.21L15.77,7.45C15.89,7.54 15.95,7.69 15.95,7.87C15.95,8.07 15.89,8.21 15.77,8.29L15.5,8.54C15.38,8.63 15.24,8.67 15.1,8.67C14.96,8.67 14.83,8.63 14.71,8.54L14.44,8.29C14.32,8.21 14.26,8.07 14.26,7.87C14.26,7.69 14.32,7.54 14.44,7.45L14.71,7.21C14.83,7.12 14.96,7.07 15.1,7.07M12,7.57C12.14,7.57 12.27,7.61 12.39,7.71L12.66,7.95C12.78,8.03 12.84,8.18 12.84,8.38C12.84,8.5 12.78,8.65 12.66,8.74L12.39,8.97C12.27,9.07 12.14,9.12 12,9.12C11.86,9.12 11.73,9.07 11.61,8.97L11.34,8.74C11.22,8.65 11.16,8.5 11.16,8.38C11.16,8.18 11.22,8.03 11.34,7.95L11.61,7.71C11.73,7.61 11.86,7.57 12,7.57M8.89,7.57C9.04,7.57 9.17,7.61 9.29,7.71L9.56,7.95C9.68,8.03 9.74,8.18 9.74,8.38C9.74,8.5 9.68,8.65 9.56,8.74L9.29,8.97C9.17,9.07 9.04,9.12 8.89,9.12C8.76,9.12 8.62,9.07 8.5,8.97L8.23,8.74C8.11,8.65 8.06,8.5 8.06,8.38C8.06,8.18 8.11,8.03 8.23,7.95L8.5,7.71C8.62,7.61 8.76,7.57 8.89,7.57M16.62,10.9C16.58,11.06 16.5,11.29 16.38,11.58C16.26,11.88 16.13,12.14 16,12.36C15.85,12.58 15.64,12.8 15.38,13C15.11,13.23 14.85,13.37 14.58,13.46C14.3,13.54 13.98,13.62 13.61,13.69C13.24,13.77 12.83,13.81 12.38,13.81C11.93,13.81 11.5,13.76 11.13,13.67C10.76,13.58 10.44,13.46 10.17,13.32C9.89,13.18 9.63,13 9.38,12.77C9.12,12.55 8.92,12.33 8.76,12.11C8.6,11.89 8.46,11.63 8.34,11.33C8.22,11 8.15,10.76 8.11,10.5C8.08,10.31 8.03,10.14 7.96,10L7.95,10C7.9,9.8 7.82,9.66 7.71,9.5C7.61,9.34 7.47,9.17 7.31,9C7.15,8.83 7,8.67 6.89,8.5L6.69,8.25L6.58,8.12L6.5,8L6.44,7.94L6.43,7.91C7.47,8.33 8.5,8.5 9.5,8.5C10.69,8.5 11.92,8.22 13.06,7.66L13.08,7.65L13.16,7.68L13.37,7.78L13.62,7.92L13.92,8.12C14.06,8.21 14.2,8.34 14.35,8.5C14.5,8.66 14.66,8.83 14.85,9C15.04,9.17 15.18,9.35 15.29,9.5C15.4,9.69 15.46,9.83 15.5,10C15.54,10.14 15.58,10.31 15.62,10.5C15.66,10.69 15.66,10.81 15.64,10.9H16.62M8.67,14.29C9,14.29 9.28,14.4 9.5,14.61L9.77,14.88C9.97,15.08 10.07,15.35 10.07,15.71C10.07,16.04 9.97,16.31 9.77,16.5L9.5,16.77C9.28,16.97 9,17.07 8.67,17.07C8.33,17.07 8.05,16.97 7.83,16.77L7.56,16.5C7.36,16.31 7.26,16.04 7.26,15.71C7.26,15.35 7.36,15.08 7.56,14.88L7.83,14.61C8.05,14.4 8.33,14.29 8.67,14.29M12,14.29C12.33,14.29 12.61,14.4 12.83,14.61L13.1,14.88C13.3,15.08 13.4,15.35 13.4,15.71C13.4,16.04 13.3,16.31 13.1,16.5L12.83,16.77C12.61,16.97 12.33,17.07 12,17.07C11.67,17.07 11.39,16.97 11.17,16.77L10.9,16.5C10.7,16.31 10.6,16.04 10.6,15.71C10.6,15.35 10.7,15.08 10.9,14.88L11.17,14.61C11.39,14.4 11.67,14.29 12,14.29M15.33,14.29C15.67,14.29 15.95,14.4 16.17,14.61L16.44,14.88C16.64,15.08 16.74,15.35 16.74,15.71C16.74,16.04 16.64,16.31 16.44,16.5L16.17,16.77C15.95,16.97 15.67,17.07 15.33,17.07C15,17.07 14.72,16.97 14.5,16.77L14.23,16.5C14.03,16.31 13.93,16.04 13.93,15.71C13.93,15.35 14.03,15.08 14.23,14.88L14.5,14.61C14.72,14.4 15,14.29 15.33,14.29Z"
													/>
												</svg>
											</div>
											<p className="text-sec text-sm sm:text-base md:text-lg leading-relaxed">
												An advertisement for the new
												IKEA kids furniture collection
											</p>
										</div>
									</div>
								</div>

								{/* Text content at bottom */}
								<div>
									<h4
										className={`${dm_sans.className} text-lg sm:text-xl md:text-2xl text-white mb-2 md:mb-4`}
									>
										Describe your ad
									</h4>
									<p
										className={`${dm_sans.className} text-sm sm:text-base md:text-lg text-sec`}
									>
										Tell us about your brand and what
										message you want to convey in your ad.
									</p>
								</div>
							</div>

							{/* Step 3 Card */}
							<div className="bg-black/40 border border-gray-800 rounded-xl md:rounded-3xl p-4 md:p-8 hover:border-vivid/30 transition-all flex flex-col">
								{/* Visual content area - Playback Demo */}
								<div className="flex-1 flex flex-col justify-center mb-4 md:mb-8">
									<div
										className="rounded-xl overflow-hidden border border-gray-800"
										style={{
											height: "250px",
											maxHeight: "40vh",
										}}
									>
										<PlaybackDemo
											jsonPath="/example_recordings/recording-UCdMzmUVLdWwD6yEzstsZVrHeZo2-o9pp4Nv4RF7LZIRXZrq2.json"
											description=""
										/>
									</div>
								</div>

								{/* Text content at bottom */}
								<div>
									<h4
										className={`${dm_sans.className} text-lg sm:text-xl md:text-2xl text-white mb-2 md:mb-4`}
									>
										Get your voice ad
									</h4>
									<p
										className={`${dm_sans.className} text-sm sm:text-base md:text-lg text-sec`}
									>
										Your professional voice ad is generated
										automatically using AI technology.
									</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Never spend money section */}
				<section className="min-h-[60vh] container mx-auto px-4 py-12 sm:py-16 md:py-0 sm:h-screen flex items-center justify-center">
					<div className="flex flex-col items-center text-center">
						<div className="flex flex-col sm:flex-row items-center">
							{/* Left decorative mic icon with negative rotation */}
							<div className="hidden sm:block mr-4">
								<svg
									viewBox="0 0 24 24"
									className="w-12 h-12 md:w-16 md:h-16 lg:w-32 lg:h-32 text-vivid opacity-20 -rotate-12"
								>
									<path
										fill="currentColor"
										d="M19,11C19,12.19 18.66,13.3 18.1,14.28L16.87,13.05C17.14,12.43 17.3,11.74 17.3,11H19M15,11.16L9,5.18V5A3,3 0 0,1 12,2A3,3 0 0,1 15,5V11.16M4.27,3L21,19.73L19.73,21L15.54,16.81C14.77,17.27 13.91,17.58 13,17.72V21H11V17.72C7.72,17.23 5,14.41 5,11H6.7C6.7,14 9.24,16.1 12,16.1C12.81,16.1 13.6,15.91 14.31,15.58L12.65,13.92L12,14A3,3 0 0,1 9,11V10.28L3,4.27L4.27,3Z"
									/>
								</svg>
							</div>

							<div>
								<h2
									className={`${dm_sans.className} text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-4 max-w-3xl`}
								>
									Never spend{" "}
									<span className="text-vivid">$$$</span> on
									voice actors ever again.
								</h2>
								<p
									className={`${dm_sans.className} text-base sm:text-lg md:text-xl lg:text-2xl text-sec mb-8 sm:mb-10 max-w-2xl`}
								>
									Professional voiceovers without the
									professional invoices.
								</p>
							</div>

							{/* Right decorative sound waves with a slight rotation */}
							<div className="hidden sm:block ml-4">
								<svg
									viewBox="0 0 24 24"
									className="w-12 h-12 md:w-16 md:h-16 lg:w-32 lg:h-32 text-vivid opacity-20 rotate-12"
								>
									<path
										fill="currentColor"
										d="M3,9H7L12,4V20L7,15H3V9M16.59,12L14,9.41L15.41,8L18,10.59L20.59,8L22,9.41L19.41,12L22,14.59L20.59,16L18,13.41L15.41,16L14,14.59L16.59,12Z"
									/>
								</svg>
							</div>
						</div>

						{/* Action buttons */}
						<div className="flex flex-col sm:flex-row gap-4 mb-8 sm:mb-10 w-full sm:w-auto">
							<Button
								variant="outline"
								size="lg"
								asChild
								className="bg-black rounded-full border-sec/30 text-sec hover:bg-sec/10 hover:text-white transition-all text-xs sm:text-base py-2 sm:py-3 px-4 sm:px-6"
							>
								<a
									href="https://cal.com/dev-mandal/15min"
									target="_blank"
									rel="noopener noreferrer"
									className="w-full sm:w-auto"
								>
									Talk to the dude who built this
								</a>
							</Button>
							<Button
								asChild
								size="lg"
								className="rounded-full bg-vivid hover:bg-vivid hover:scale-105 transition-all text-black text-xs sm:text-base py-2 sm:py-3 px-4 sm:px-6"
							>
								<Link href="/auth" className="w-full sm:w-auto">
									Try Addie for free
								</Link>
							</Button>
						</div>
					</div>
				</section>

				{/* Footer */}
				<footer className="border-t border-zinc-800 pt-8 sm:pt-12 relative overflow-hidden">
					{/* Top footer bar */}
					<div className="container mx-auto px-4 lg:px-2 flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-12">
						<div className="mb-4 sm:mb-0">
							<h3
								className={`${dm_serif.className} text-5xl sm:text-6xl md:text-8xl text-vivid`}
							>
								Addie
							</h3>
						</div>
						<div
							className={`${dm_sans.className} text-sec text-lg sm:text-xl md:text-3xl`}
						>
							Beautiful voice ads in minutes.
						</div>
					</div>

					{/* Main footer content */}
					<div className="container mx-auto px-4 lg:px-2 flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-16">
						<div className="mb-4 sm:mb-0">
							<p
								className={`${dm_sans.className} text-zinc-500 text-xs sm:text-sm`}
							>
								{/* © {new Date().getFullYear()} Addie. All rights
								reserved. */}
							</p>
						</div>

						{/* Social media links and operational status */}
						<div className="flex flex-col items-center sm:items-end">
							{/* Social media links */}
							<div className="flex space-x-4 mb-4">
								<a
									href="#"
									className="text-zinc-500 hover:text-vivid transition-colors"
								>
									<svg
										viewBox="0 0 24 24"
										className="w-5 h-5 sm:w-6 sm:h-6"
									>
										<path
											fill="currentColor"
											d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
										/>
									</svg>
								</a>
								<a
									href="#"
									className="text-zinc-500 hover:text-vivid transition-colors"
								>
									<svg
										viewBox="0 0 24 24"
										className="w-5 h-5 sm:w-6 sm:h-6"
									>
										<path
											fill="currentColor"
											d="M19 3A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19M18.5 18.5V13.2A3.26 3.26 0 0 0 15.24 9.94C14.39 9.94 13.4 10.46 12.92 11.24V10.13H10.13V18.5H12.92V13.57C12.92 12.8 13.54 12.17 14.31 12.17A1.4 1.4 0 0 1 15.71 13.57V18.5H18.5M6.88 8.56A1.68 1.68 0 0 0 8.56 6.88C8.56 5.95 7.81 5.19 6.88 5.19A1.69 1.69 0 0 0 5.19 6.88C5.19 7.81 5.95 8.56 6.88 8.56M8.27 18.5V10.13H5.5V18.5H8.27Z"
										/>
									</svg>
								</a>
							</div>

							{/* Operational status indicator */}
							<div className="flex items-center">
								<span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
								<span className="text-zinc-500 text-xs">
									Operational
								</span>
							</div>
						</div>
					</div>

					{/* Large background text - properly positioned at bottom with half cut off */}
					<div className="w-full h-[8rem] sm:h-[12rem] md:h-[18rem] overflow-hidden">
						<span
							className={`${dm_serif.className} text-[10rem] sm:text-[15rem] md:text-[20rem] lg:text-[30rem] text-sec/10 leading-none block text-center`}
						>
							Addie
						</span>
					</div>
				</footer>
			</main>
		</div>
	);
}
