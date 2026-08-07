"use client";

import { Github } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { signInWithProvider } from "@/lib/auth";

export function LoginButtons() {
  return (
    <div className="flex w-full flex-col gap-3">
      <button
        onClick={() => signInWithProvider("google")}
        className="flex items-center justify-center gap-3 rounded-xl border border-zinc-300 bg-white px-4 py-3 font-medium text-zinc-700 transition-all duration-300 hover:border-indigo-400 hover:shadow-md"
      >
        <FcGoogle className="text-xl" />
        Continue with Google
      </button>

      <button
        onClick={() => signInWithProvider("github")}
        className="flex items-center justify-center gap-3 rounded-xl bg-zinc-900 px-4 py-3 font-medium text-white transition-all duration-300 hover:bg-black hover:shadow-md"
      >
        <Github className="h-5 w-5" />
        Continue with GitHub
      </button>
    </div>
  );
}