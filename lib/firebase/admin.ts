import {
	initializeApp,
	getApps,
	cert,
	ServiceAccount,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import serviceAccount from "@/serviceAccountKey.json";

// Only initialize if there are no apps already initialized
if (!getApps().length) {
	initializeApp({
		credential: cert(serviceAccount as ServiceAccount),
	});
}

export const adminAuth = getAuth();
