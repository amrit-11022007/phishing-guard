"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Eye, EyeOff, Lock, Mail, User } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5001/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to register operator");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0b0d] px-4 py-12 sm:px-6 lg:px-8 font-mono">
      <div className="w-full max-w-md space-y-8 bg-[#12141a] p-8 rounded-xl border border-cyber-cyan/20 shadow-[0_0_30px_rgba(0,243,255,0.07)]">
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan shadow-[0_0_15px_rgba(0,243,255,0.2)]">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-white uppercase">
            Register Terminal
          </h2>
          <p className="mt-2 text-center text-xs text-gray-400">
            Set up credentials to initialize Cyber Shield access
          </p>
        </div>

        {error && (
          <div className="bg-cyber-red/10 border border-cyber-red/30 text-cyber-red px-4 py-3 rounded-lg text-xs font-semibold glow-red">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Operator Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0a0b0d] border border-gray-800 focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan text-white text-sm rounded-lg block pl-10 pr-3 py-2.5 outline-none transition-all duration-300"
                  placeholder="Operator #1024"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0a0b0d] border border-gray-800 focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan text-white text-sm rounded-lg block pl-10 pr-3 py-2.5 outline-none transition-all duration-300"
                  placeholder="admin@cybershield.net"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Set Access Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0a0b0d] border border-gray-800 focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan text-white text-sm rounded-lg block pl-10 pr-10 py-2.5 outline-none transition-all duration-300"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-cyber-cyan"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-lg border border-transparent bg-cyber-cyan py-2.5 px-4 text-xs font-bold text-[#0a0b0d] uppercase tracking-wider hover:bg-cyber-cyan/80 focus:outline-none focus:ring-2 focus:ring-cyber-cyan focus:ring-offset-2 transition-all duration-300 shadow-[0_0_15px_rgba(0,243,255,0.3)] disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0a0b0d] border-t-transparent"></div>
              ) : (
                "Initialize Operator Profile"
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-gray-450 mt-4">
          <span className="text-gray-500">Already registered?</span>{" "}
          <Link href="/login" className="text-cyber-cyan hover:underline glow-cyan font-bold transition-all duration-300">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
