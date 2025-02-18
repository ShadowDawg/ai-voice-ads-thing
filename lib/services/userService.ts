import { User } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  photoURL: string | null;
  createdAt: string;
  lastLoginAt: string;
}

export async function createOrUpdateUser(user: User) {
  try {
    if (!user.uid) {
      throw new Error("No user ID provided");
    }

    const userDoc = doc(db, "users", user.uid);
    const userSnapshot = await getDoc(userDoc);

    if (!userSnapshot.exists()) {
      const firstName = user.displayName?.split(" ")[0]?.trim() || "";
      const lastName =
        user.displayName?.split(" ").slice(1).join(" ")?.trim() || "";

      if (!user.email) {
        throw new Error("Email is required");
      }

      const userData: UserData = {
        firstName,
        lastName,
        email: user.email,
        photoURL: user.photoURL || null,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      await setDoc(userDoc, userData);
    } else {
      await setDoc(
        userDoc,
        {
          lastLoginAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
  } catch (error) {
    console.error("Error in createOrUpdateUser:", error);
    throw new Error("Failed to create/update user profile");
  }
}
