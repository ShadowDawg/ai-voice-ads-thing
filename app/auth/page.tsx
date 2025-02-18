// This is a Server Component (no "use client")
import AuthForm from "./AuthForm";

export default function AuthPage() {
	return (
		<div className="min-h-screen bg-background flex items-center justify-center">
			<div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
				<div className="space-y-2 text-center">
					<h1 className="text-3xl font-bold text-eerieBlack">
						Welcome to VoiceAds
					</h1>
					<p className="text-muted-foreground">
						Create an account or log in to get started
					</p>
				</div>

				<AuthForm />
			</div>
		</div>
	);
}
