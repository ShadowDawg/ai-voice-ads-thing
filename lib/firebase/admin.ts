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
		// private_key: process.env.FIREBASE_PRIVATE_KEY?.split(
		// 	String.raw`\n`
		// ).join("\n"),
		// private_key: JSON.parse(process.env.FIREBASE_PRIVATE_KEY || "{}")
		// 	.privateKey,
		private_key: (() => {
			try {
				const rawValue = process.env.FIREBASE_PRIVATE_KEY || "{}";
				// Remove surrounding quotes if present (handles both ' and " quotes)
				const cleanedJson = rawValue.replace(/^['"]|['"]$/g, "");
				// return JSON.parse(cleanedJson).privateKey;
				return JSON.parse(cleanedJson).privateKey.replace(/\\n/g, "\n");
			} catch (error) {
				console.error("Error parsing private key:", error);
				return "";
			}
		})(),
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
	var rawValue = process.env.FIREBASE_PRIVATE_KEY || "{}";
	// Remove surrounding quotes if present (handles both ' and " quotes)
	var cleanedJson = rawValue.replace(/^['"]|['"]$/g, "");
	var privKey = JSON.parse(cleanedJson).privateKey;
	console.log("Firebase private key sample:", privKey.slice(0, 140));
	console.log(
		"Formatted key sample:",
		privKey.replace(/\\n/g, "\n").slice(0, 140)
	);
}

export const adminAuth = getAuth();
