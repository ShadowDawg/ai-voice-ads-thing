import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google";
import "./globals.css";
import SupabaseProvider from "@/lib/providers/supabase-provider";
import { AuthContextProvider } from "./context/AuthContext";
import { VoiceLinesProvider } from "@/contexts/VoiceLinesContext";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "VoiceAds - AI-Powered Voice Advertising",
	description:
		"Create professional voice ads for podcasts and radio in minutes using AI technology.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<Providers>
					<VoiceLinesProvider>
						<AuthContextProvider>{children}</AuthContextProvider>
					</VoiceLinesProvider>
				</Providers>
			</body>
		</html>
	);
}
