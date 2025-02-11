// app/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import localFont from "next/font/local";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

const andulka = localFont({ src: "../public/fonts/andulka.otf" });

export default function Home() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push("/studio");
    }
  }, [user, loading, router]);

  const handleGetStarted = async () => {
    try {
      const userCredential = await signInWithGoogle();
      if (userCredential && userCredential.user) {
        const userDoc = doc(db, "users", userCredential.user.uid);
        const userSnapshot = await getDoc(userDoc);

        if (!userSnapshot.exists()) {
          // Create new user document if it doesn't exist
          const userData = {
            firstName: userCredential.user.displayName?.split(" ")[0] || "",
            lastName:
              userCredential.user.displayName?.split(" ").slice(1).join(" ") ||
              "",
            email: userCredential.user.email,
            photoURL: userCredential.user.photoURL,
            createdAt: new Date().toISOString(),
          };

          await setDoc(userDoc, userData);
        }
      }
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  return (
    <div className="min-h-screen bg-eerieBlack">
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="container flex flex-col items-center text-center">
          <h1
            className={`${andulka.className} text-4xl font-bold sm:text-5xl md:text-8xl lg:text-9xl text-cornsilk tracking-normal`}
          >
            Addie
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl text-eerieBlack">
            Create beautiful voice ads for podcasts and radio in minutes.
          </p>
          <div className="flex gap-4">
            <Button
              size="lg"
              className="bg-cornsilk text-eerieBlack mt-6 hover:bg-cornsilk/90"
              onClick={handleGetStarted}
              disabled={loading}
            >
              {loading ? "Loading..." : "Get Started"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
