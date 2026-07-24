"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export default function RegisterPage() {
  const router = useRouter();

  const { signUp, user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/account");
    }
  }, [user, authLoading, router]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password);

      setSuccess(
        "Registration successful! Please check your email to verify your account."
      );

      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-black">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        .cq-font { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }

        .cq-gradient-text {
          background: linear-gradient(90deg, #7C5CFC 0%, #22C7E0 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .cq-logo-i { color: #7C5CFC; }
        .cq-logo-q { color: #22C7E0; }

        .cq-focus:focus {
          outline: none;
          border-color: #111111;
          box-shadow: 0 0 0 3px rgba(124,92,252,.18);
        }
      `}</style>

      <div className="pointer-events-none absolute -top-40 -left-40 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(124,92,252,0.16),transparent_70%)] blur-2xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(34,199,224,0.14),transparent_70%)] blur-2xl" />

      <div className="relative z-10 px-8 pt-8 md:px-16">
        <Link
          href="/"
          className="cq-font inline-flex items-baseline text-2xl font-extrabold tracking-tight"
        >
          <span>Cart</span>
          <span className="cq-logo-i">I</span>
          <span className="cq-logo-q">Q</span>
        </Link>
      </div>

      <div className="relative z-10 flex min-h-[calc(100vh-88px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center">
            <span className="cq-font inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs font-semibold tracking-wide text-[#7C5CFC] shadow-sm">
              ✨ CREATE ACCOUNT
            </span>
          </div>

          <h1 className="cq-font text-center text-4xl font-extrabold tracking-tight">
            Join <span className="cq-gradient-text">CartIQ</span>
          </h1>

          <p className="cq-font mt-3 text-center text-gray-500">
            Create your account to start shopping smarter.
          </p>

          <div className="mt-8 rounded-3xl border border-black/5 bg-white p-8 shadow-[0_20px_50px_rgba(17,17,17,.08)]">
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Email
                </label>

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="cq-focus w-full rounded-2xl border border-black/10 bg-[#FAFAFA] px-4 py-3.5"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Password
                </label>

                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="cq-focus w-full rounded-2xl border border-black/10 bg-[#FAFAFA] px-4 py-3.5"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Confirm Password
                </label>

                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="cq-focus w-full rounded-2xl border border-black/10 bg-[#FAFAFA] px-4 py-3.5"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-full bg-black py-3.5 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-black underline decoration-[#7C5CFC] decoration-2 underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}