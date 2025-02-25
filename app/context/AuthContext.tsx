// app/context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
	onAuthStateChanged,
	signInWithPopup,
	GoogleAuthProvider,
	signOut,
	User,
	UserCredential,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
	user: User | null;
	loading: boolean;
	signInWithGoogle: () => Promise<UserCredential>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	loading: true,
	signInWithGoogle: async () => {
		throw new Error("Method not implemented");
	},
	logout: async () => {
		throw new Error("Method not implemented");
	},
});

export const AuthContextProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user) {
				setUser(user);
			} else {
				setUser(null);
			}
			setLoading(false);
		});

		return () => unsubscribe();
	}, []);

	const signInWithGoogle = async () => {
		try {
			const provider = new GoogleAuthProvider();
			const result = await signInWithPopup(auth, provider);
			return result;
		} catch (error) {
			console.error("Error signing in with Google:", error);
			throw error;
		}
	};

	const logout = async () => {
		try {
			await signOut(auth);
		} catch (error) {
			console.error("Error signing out:", error);
		}
	};

	return (
		<AuthContext.Provider
			value={{ user, loading, signInWithGoogle, logout }}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
