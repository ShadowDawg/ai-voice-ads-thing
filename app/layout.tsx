import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthContextProvider } from "./context/AuthContext";
import { PostHogProvider, Providers } from "./providers";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Shiro - Your AI Assistant",
	description: "Automate the mundane and focus on what matters most.",
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
					<AuthContextProvider>
						<PostHogProvider>{children}</PostHogProvider>
						<Analytics />
					</AuthContextProvider>
				</Providers>
			</body>
		</html>
	);
}
