"use client";

import { useState } from "react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to send message.");
      }

      setStatus("Message sent. We’ll be in touch soon.");
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Name"
        className="h-12 w-full rounded-full border border-black/10 bg-[#f7f3eb] px-4 outline-none"
        required
      />
      <input
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        type="email"
        placeholder="Email"
        className="h-12 w-full rounded-full border border-black/10 bg-[#f7f3eb] px-4 outline-none"
        required
      />
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Tell us what you need"
        className="min-h-32 w-full rounded-[24px] border border-black/10 bg-[#f7f3eb] px-4 py-3 outline-none"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-zinc-950 px-6 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-600"
      >
        {loading ? "Sending..." : "Send inquiry"}
      </button>
      {status ? <p className="text-sm text-zinc-600">{status}</p> : null}
    </form>
  );
}
