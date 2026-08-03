"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  LayoutDashboard,
  FileText,
  Brain,
  Settings,
  Plus,
  LogOut,
  Bell,
  CheckCircle,
  AlertTriangle,
  User,
  X
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  name?: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Real-time scanning modal states
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanText, setScanText] = useState("");
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState("");

  // Validate Authentication on Mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!token) {
      router.push("/login");
    } else {
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleManualScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanText.trim()) return;
    setScanLoading(true);
    setScanError("");
    setScanResult(null);

    try {
      // 1. Send text to backend analyze endpoint
      const res = await fetch("http://localhost:5001/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: scanText }),
      });

      const analysisData = await res.json();
      if (!res.ok) throw new Error("Analysis failed");

      // 2. Map risk level and AI probability for our backend logging endpoint
      const confidence = analysisData.phishing.confidence;
      let riskLevel: "low" | "medium" | "high" | "critical" = "low";
      if (confidence >= 0.8) riskLevel = "critical";
      else if (confidence >= 0.55) riskLevel = "high";
      else if (confidence >= 0.3) riskLevel = "medium";

      const aiConfidence = analysisData.aiGenerated.confidence;
      let aiProbability: "human" | "likely_human" | "uncertain" | "likely_ai" | "ai" = "human";
      if (aiConfidence >= 0.8) aiProbability = "ai";
      else if (aiConfidence >= 0.6) aiProbability = "likely_ai";
      else if (aiConfidence >= 0.4) aiProbability = "uncertain";
      else if (aiConfidence >= 0.2) aiProbability = "likely_human";

      // 3. Log the scan to the database (which will also broadcast it via WebSocket)
      const logRes = await fetch("http://localhost:5001/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || "manual-user",
          emailMetadata: {
            senderDomain: "manual-input.portal",
            subjectLength: 0,
            bodyLength: scanText.length,
            linkCount: (scanText.match(/https?:\/\/[^\s]+/g) || []).length,
          },
          analysis: {
            scanType: "manual_paste",
            timestamp: new Date().toISOString(),
            duration: Math.round(Math.random() * 80 + 20),
            phishing: {
              isPhishing: analysisData.phishing.isPhishing,
              confidence: analysisData.phishing.confidence,
              riskLevel,
            },
            aiGenerated: {
              isAI: analysisData.aiGenerated.isAI,
              confidence: analysisData.aiGenerated.confidence,
              aiProbability,
            },
          },
          extension: {
            version: "2.1.0",
            browser: "dashboard-console",
            timestamp: new Date().toISOString(),
          },
        }),
      });

      const logData = await logRes.json();
      if (!logRes.ok) throw new Error("Failed to log scan");

      setScanResult({
        phishing: {
          isPhishing: analysisData.phishing.isPhishing,
          confidence: analysisData.phishing.confidence,
          riskLevel,
        },
        aiGenerated: {
          isAI: analysisData.aiGenerated.isAI,
          confidence: analysisData.aiGenerated.confidence,
          aiProbability,
        },
      });
      setScanText("");
    } catch (err: any) {
      setScanError(err.message || "Error running scan");
    } finally {
      setScanLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-cyber-bg text-cyber-cyan font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyber-cyan border-t-transparent"></div>
          <p className="text-sm tracking-widest animate-pulse font-semibold">INITIALIZING ENVIRONMENT...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Scan Logs", href: "/dashboard/logs", icon: FileText },
    { name: "AI Analysis", href: "#", icon: Brain, disabled: true },
    { name: "Settings", href: "#", icon: Settings, disabled: true }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0b0d] text-gray-200 font-sans antialiased">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-[#12141a] border-r border-gray-900 flex flex-col justify-between shrink-0 font-mono">
        <div>
          {/* Logo block */}
          <div className="p-6 border-b border-gray-950/60">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-cyber-cyan/15 border border-cyber-cyan/30 flex items-center justify-center text-cyber-cyan shadow-[0_0_10px_rgba(0,243,255,0.2)]">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-cyber-cyan tracking-wider uppercase">CYBER_SHIELD</h1>
                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-tight">Email Protection Active</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 mt-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              if (item.disabled) {
                return (
                  <div
                    key={item.name}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-gray-600 cursor-not-allowed select-none transition-all duration-300"
                  >
                    <Icon className="h-4.5 w-4.5" />
                    <span>{item.name}</span>
                  </div>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase transition-all duration-300 ${
                    isActive
                      ? "bg-cyber-cyan/10 border border-cyber-cyan/20 text-cyber-cyan shadow-[0_0_15px_rgba(0,243,255,0.08)] font-bold"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/40"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Action Trigger & Operator details */}
        <div className="p-4 space-y-4 border-t border-gray-950/60">
          <button
            onClick={() => {
              setShowScanModal(true);
              setScanResult(null);
              setScanError("");
            }}
            className="w-full bg-[#cffafe] hover:bg-cyber-cyan text-[#0a0b0d] font-bold text-xs uppercase py-3 rounded-md flex items-center justify-center gap-2 tracking-widest transition-all duration-300 shadow-[0_0_15px_rgba(207,250,254,0.2)]"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            START NEW SCAN
          </button>

          <div className="flex items-center justify-between bg-[#171a22] p-3 rounded-lg border border-gray-800/40">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-8 w-8 rounded-md bg-cyber-purple/10 border border-cyber-purple/30 text-cyber-purple flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {user?.name?.slice(0, 2) || "OP"}
              </div>
              <div className="overflow-hidden leading-tight">
                <p className="text-xs font-bold text-gray-200 truncate">{user?.name || "Operator"}</p>
                <span className="text-[10px] text-cyber-lime font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyber-lime inline-block shadow-[0_0_5px_#adff2f]"></span>
                  Online
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout Operator"
              className="text-gray-500 hover:text-cyber-red p-1 rounded transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-[#0a0b0d]">
        {/* Top Header bar */}
        <header className="h-16 border-b border-gray-950/60 flex items-center justify-between px-8 shrink-0 bg-[#0e1014] font-mono">
          <span className="text-xs font-bold text-gray-500 tracking-wider">SCAN_CORE v2.1</span>
          
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-white relative p-1.5 rounded-md hover:bg-gray-800/40 transition-colors">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1 right-1.5 h-1.5 w-1.5 rounded-full bg-cyber-cyan shadow-[0_0_5px_#00f3ff]"></span>
            </button>
            
            <button className="text-gray-400 hover:text-white p-1.5 rounded-md hover:bg-gray-800/40 transition-colors">
              <Shield className="h-4.5 w-4.5" />
            </button>

            <div className="h-8 w-8 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/20 flex items-center justify-center text-cyber-cyan">
              <User className="h-4 w-4" />
            </div>
          </div>
        </header>

        {/* Content body */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </main>

      {/* START NEW SCAN DIALOG MODAL */}
      {showScanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-mono">
          <div className="bg-[#12141a] border border-cyber-cyan/35 w-full max-w-lg rounded-xl shadow-[0_0_40px_rgba(0,243,255,0.15)] overflow-hidden transition-all duration-300">
            {/* Modal Title bar */}
            <div className="px-6 py-4 border-b border-gray-900 flex justify-between items-center bg-[#171a22]">
              <span className="text-xs font-bold text-cyber-cyan flex items-center gap-2 uppercase tracking-widest">
                <Shield className="h-4.5 w-4.5 animate-pulse" />
                Initialize Manual Scanner
              </span>
              <button
                onClick={() => setShowScanModal(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body content */}
            <div className="p-6 space-y-6">
              {scanResult ? (
                <div className="space-y-4">
                  <div className="border border-gray-900 bg-[#0a0b0d] p-5 rounded-lg space-y-3.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-450 border-b border-gray-900 pb-2">Analysis Results</p>
                    
                    <div className="flex justify-between items-center text-sm py-1">
                      <span className="text-gray-400">Phishing Status:</span>
                      <span className={`font-bold flex items-center gap-1.5 ${
                        scanResult.phishing.isPhishing ? "text-cyber-red glow-red" : "text-cyber-lime glow-lime"
                      }`}>
                        {scanResult.phishing.isPhishing ? (
                          <>
                            <AlertTriangle className="h-4 w-4" />
                            Phishing Detected ({(scanResult.phishing.confidence * 100).toFixed(0)}%)
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Secure ({(scanResult.phishing.confidence * 100).toFixed(0)}%)
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm py-1">
                      <span className="text-gray-400">AI Origin:</span>
                      <span className={`font-bold flex items-center gap-1.5 ${
                        scanResult.aiGenerated.isAI ? "text-cyber-pink" : "text-cyber-cyan glow-cyan"
                      }`}>
                        {scanResult.aiGenerated.isAI ? (
                          <>🤖 AI-Generated ({(scanResult.aiGenerated.confidence * 100).toFixed(0)}%)</>
                        ) : (
                          <>🧑 Human Authored</>
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm py-1">
                      <span className="text-gray-400">Risk Tier:</span>
                      <span className={`text-xs px-2 py-0.5 rounded font-black border uppercase ${
                        scanResult.phishing.riskLevel === "critical"
                          ? "bg-cyber-red/10 border-cyber-red/35 text-cyber-red glow-red"
                          : scanResult.phishing.riskLevel === "high"
                          ? "bg-amber-500/10 border-amber-500/35 text-amber-500"
                          : scanResult.phishing.riskLevel === "medium"
                          ? "bg-cyan-500/10 border-cyan-500/35 text-cyan-500"
                          : "bg-cyber-lime/10 border-cyber-lime/35 text-cyber-lime"
                      }`}>
                        {scanResult.phishing.riskLevel}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setScanResult(null)}
                      className="w-full bg-[#171a22] hover:bg-gray-800 text-white font-bold text-xs uppercase py-2.5 rounded-md border border-gray-800 transition-colors"
                    >
                      Scan Another
                    </button>
                    <button
                      onClick={() => setShowScanModal(false)}
                      className="w-full bg-cyber-cyan hover:bg-cyber-cyan/85 text-[#0a0b0d] font-bold text-xs uppercase py-2.5 rounded-md transition-colors"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleManualScan} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Copy & Paste Email Content or Suspicious Text
                    </label>
                    <textarea
                      required
                      value={scanText}
                      onChange={(e) => setScanText(e.target.value)}
                      placeholder="Paste suspicious text here..."
                      rows={5}
                      className="w-full bg-[#0a0b0d] border border-gray-800 focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan text-white text-sm rounded-lg p-3 outline-none transition-all duration-300 resize-none"
                    ></textarea>
                  </div>

                  {scanError && (
                    <div className="text-cyber-red text-xs glow-red font-semibold bg-cyber-red/10 border border-cyber-red/35 p-3 rounded-lg">
                      {scanError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={scanLoading || !scanText.trim()}
                    className="w-full bg-cyber-cyan hover:bg-cyber-cyan/80 text-[#0a0b0d] font-bold text-xs uppercase py-2.5 rounded-lg tracking-wider transition-colors disabled:opacity-50"
                  >
                    {scanLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0a0b0d] border-t-transparent"></span>
                        Scanning ML Patterns...
                      </span>
                    ) : (
                      "Deconstruct Text & Analyze"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
