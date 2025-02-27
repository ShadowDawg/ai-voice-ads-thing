import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthContextProvider } from "./context/AuthContext";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

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
					<AuthContextProvider>{children}</AuthContextProvider>
				</Providers>
			</body>
		</html>
	);
}
