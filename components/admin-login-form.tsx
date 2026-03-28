"use client";

import { FormEvent, useState } from "react";

export function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password.trim()) {
      setError("Password is required.");
      return;
    }

    setLoading(true);
    setError(null);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      setError(payload.message ?? "Invalid password.");
      setLoading(false);
      return;
    }

    window.location.reload();
  }

  return (
    <section className="card gradient-panel mx-auto w-full max-w-md p-5 sm:p-7">
      <p className="soft-pill">Private Host Access</p>
      <h1 className="mt-3 font-[var(--font-serif)] text-3xl font-semibold">Host Admin</h1>
      <p className="mt-2 text-sm text-[var(--ink-soft)]">
        Enter the admin password to access uploads and controls.
      </p>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm outline-none ring-rosegold/25 focus:ring"
            autoComplete="current-password"
          />
        </label>
        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <button className="button-primary w-full" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </section>
  );
}
