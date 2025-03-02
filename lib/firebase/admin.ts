import {
	initializeApp,
	getApps,
	cert,
	ServiceAccount,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Only initialize if there are no apps already initialized, hmm
if (!getApps().length) {
	// Use environment variables instead of importing the file directly
	const serviceAccountConfig = {
		type: process.env.FIREBASE_TYPE,
		project_id: process.env.FIREBASE_PROJECT_ID,
		private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
		// fix newline characters
		// privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
		private_key: process.env.FIREBASE_PRIVATE_KEY?.split(
			String.raw`\n`
		).join("\n"),
		client_email: process.env.FIREBASE_CLIENT_EMAIL,
		client_id: process.env.FIREBASE_CLIENT_ID,
		auth_uri: process.env.FIREBASE_AUTH_URI,
		token_uri: process.env.FIREBASE_TOKEN_URI,
		auth_provider_x509_cert_url:
			process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
		client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
		universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
	};

	initializeApp({
		credential: cert(serviceAccountConfig as ServiceAccount),
	});

	console.log(
		"Firebase private key sample:",
		process.env.FIREBASE_PRIVATE_KEY?.slice(0, 20)
	);
	console.log(
		"Formatted key sample:",
		process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n").slice(0, 20)
	);
}

export const adminAuth = getAuth();
