"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Studio() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user && !loading) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-eerieBlack p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-cornsilk">Addie Studio</h1>
          <Button
            onClick={logout}
            variant="outline"
            className="text-eerieBlack border-cornsilk hover:bg-cornsilk hover:text-eerieBlack"
          >
            Sign Out
          </Button>
        </div>
        <div className="flex flex-col gap-6">
          <div className="text-cornsilk">
            Welcome, {user?.email}! This is where we'll build the studio
            functionality.
          </div>
          <Button
            onClick={() => router.push("/studio/new")}
            className="bg-cornsilk text-eerieBlack hover:bg-gray-200 w-fit"
          >
            New Recording
          </Button>
        </div>
      </div>
    </div>
  );
}
