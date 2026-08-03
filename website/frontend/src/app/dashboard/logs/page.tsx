"use client";

import React, { useEffect, useState } from "react";
import { Search, SlidersHorizontal, RefreshCw, X, FileJson, AlertCircle } from "lucide-react";

interface ScanLog {
  id: string;
  userId: string;
  senderDomain: string | null;
  subjectLength: number;
  bodyLength: number;
  linkCount: number;
  scanType: string;
  timestamp: string;
  duration: number;
  isPhishing: boolean;
  phishingConfidence: number;
  riskLevel: string;
  isAI: boolean;
  aiConfidence: number;
  aiProbability: string;
  extensionVersion: string;
  browser: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<ScanLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("Just now");
  
  // Filter States
  const [riskFilter, setRiskFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  // Modal State for RAW JSON View
  const [showRawModal, setShowRawModal] = useState(false);

  // Fetch log entries
  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      
      let url = `http://localhost:5001/api/logs?riskLevel=${riskFilter}&scanType=${typeFilter}`;
      if (dateFilter) {
        url += `&date=${dateFilter}`;
      }
      if (appliedSearch) {
        url += `&search=${encodeURIComponent(appliedSearch)}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to load logs");
      
      const data = await res.json();
      setLogs(data);
      
      // Auto-select first item if none is selected
      if (data.length > 0 && !selectedLog) {
        setSelectedLog(data[0]);
      }
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [riskFilter, typeFilter, dateFilter, appliedSearch]);

  // Real-time WebSockets integration
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5001");

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.event === "NEW_SCAN") {
          const newScan = payload.data as ScanLog;
          
          // Prepend new scan record to the local logs list if it matches filters
          setLogs((prevLogs) => {
            const matchesRisk = riskFilter === "All" || newScan.riskLevel.toLowerCase() === riskFilter.toLowerCase();
            const matchesType = typeFilter === "All" || newScan.scanType.toLowerCase() === typeFilter.toLowerCase();
            
            if (matchesRisk && matchesType) {
              const updated = [newScan, ...prevLogs];
              // Auto-select if nothing selected
              if (updated.length === 1) setSelectedLog(newScan);
              return updated;
            }
            return prevLogs;
          });
          
          setLastUpdated("Just now");
        }
      } catch (err) {
        console.error("WS event error:", err);
      }
    };

    return () => {
      ws.close();
    };
  }, [riskFilter, typeFilter]);

  // Helper to format timestamps
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "Unknown";
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  };

  // Heuristic-based AI analysis labels matching the mockup style
  const getAiSummaryLabel = (log: ScanLog) => {
    if (log.isPhishing) {
      if (log.phishingConfidence > 0.8) return "Phishing Intent Detected";
      return "Suspicious Language Patterns";
    }
    if (log.linkCount > 2) return "Suspicious Attachments";
    if (log.isAI) return "Automated Newsletter";
    return "Likely Human";
  };

  const getCriticalFindings = (log: ScanLog) => {
    const findings = [];
    if (log.isPhishing) {
      findings.push("Critical phishing pattern matched");
    }
    if (log.senderDomain && (log.senderDomain.includes("secure") || log.senderDomain.includes("update") || log.senderDomain.includes("bank"))) {
      findings.push("Potential domain spoofing detected");
    } else if (log.isPhishing && log.senderDomain === "manual-input.portal") {
      findings.push("Urgent threat content paste logged");
    }
    if (log.linkCount > 2) {
      findings.push("Suspicious link hiding/count matches");
    }
    if (log.bodyLength > 1000 && log.isAI) {
      findings.push("Automated language signatures flag");
    }
    if (findings.length === 0) {
      findings.push("No immediate threat findings identified");
    }
    return findings;
  };

  const handleApplySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchQuery);
  };

  return (
    <div className="flex h-full overflow-hidden p-8 gap-6 font-mono text-xs">
      
      {/* LEFT SECTION (LOGS LIST & FILTERS) */}
      <div className="flex-1 flex flex-col min-w-0 h-full justify-between">
        
        {/* LOGS HEADER & FILTERS */}
        <div className="space-y-5 pb-4 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-cyber-cyan glow-cyan tracking-wider uppercase">Scan Logs</h2>
            <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1.5">
              <RefreshCw className="h-3 w-3 animate-spin text-cyber-cyan" />
              Last updated: {lastUpdated}
            </span>
          </div>

          {/* FILTER CRITERIAS PANEL */}
          <div className="bg-[#12141a] p-4 rounded-xl border border-gray-900 flex flex-wrap gap-4 items-center justify-between shadow-sm">
            <div className="flex flex-wrap gap-3 items-center">
              {/* Risk dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-gray-550 uppercase text-[9px] font-bold">Risk Level:</span>
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="bg-[#0a0b0d] border border-gray-800 text-white rounded px-2.5 py-1 outline-none focus:border-cyber-cyan transition-colors font-semibold"
                >
                  <option value="All">All</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              {/* Scan Type dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-gray-550 uppercase text-[9px] font-bold">Scan Type:</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-[#0a0b0d] border border-gray-800 text-white rounded px-2.5 py-1 outline-none focus:border-cyber-cyan transition-colors font-semibold"
                >
                  <option value="All">All</option>
                  <option value="email">Email Scan</option>
                  <option value="manual_paste">Manual Paste</option>
                </select>
              </div>

              {/* Date Input */}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-[#0a0b0d] border border-gray-800 text-white rounded px-2.5 py-0.5 outline-none focus:border-cyber-cyan transition-colors font-semibold"
                />
              </div>
            </div>

            {/* Search Input */}
            <form onSubmit={handleApplySearch} className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0a0b0d] border border-gray-850 text-white rounded pl-8 pr-3 py-1 outline-none focus:border-cyber-cyan transition-colors"
                />
                <Search className="h-3.5 w-3.5 text-gray-550 absolute left-2.5 top-1.5" />
              </div>
              <button
                type="submit"
                className="bg-gray-800 hover:bg-gray-700 text-white px-3.5 py-1 rounded border border-gray-700 font-bold uppercase transition-colors"
              >
                Apply
              </button>
            </form>
          </div>
        </div>

        {/* LOGS DATATABLE CONTAINER */}
        <div className="flex-1 overflow-y-auto border border-gray-900 bg-[#12141a]/40 rounded-xl relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center text-cyber-cyan">
              <div className="flex flex-col items-center gap-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyber-cyan border-t-transparent"></div>
                <span>FETCHING CYBER LOGS...</span>
              </div>
            </div>
          ) : logs.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-2">
              <AlertCircle className="h-8 w-8 text-gray-600" />
              <span className="font-bold uppercase tracking-widest text-[10px]">No Scan Records Found</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-950 text-gray-500 uppercase text-[9px] font-extrabold tracking-wider bg-[#12141a]/90 sticky top-0 z-10">
                  <th className="py-3 px-5">Timestamp</th>
                  <th className="py-3 px-5">Sender / Source</th>
                  <th className="py-3 px-5">Risk Level</th>
                  <th className="py-3 px-5">AI Analysis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-900/40">
                {logs.map((log) => {
                  const isActive = selectedLog?.id === log.id;
                  const isMail = log.scanType === "email";

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className={`cursor-pointer transition-all duration-300 ${
                        isActive
                          ? "bg-cyber-cyan/5 border-l-2 border-cyber-cyan shadow-[inset_0_0_15px_rgba(0,243,255,0.02)]"
                          : "hover:bg-gray-800/20"
                      }`}
                    >
                      <td className="py-4 px-5 text-gray-400 font-semibold">{formatTime(log.timestamp)}</td>
                      <td className="py-4 px-5 font-bold text-gray-200">
                        {isMail ? log.senderDomain || "unknown-sender" : "[Manual Paste Input]"}
                      </td>
                      <td className="py-4 px-5">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black border uppercase tracking-widest ${
                          log.riskLevel === "critical"
                            ? "bg-cyber-red/10 border-cyber-red/35 text-cyber-red glow-red"
                            : log.riskLevel === "high"
                            ? "bg-amber-500/10 border-amber-500/35 text-amber-500"
                            : log.riskLevel === "medium"
                            ? "bg-cyan-500/10 border-cyan-500/35 text-cyan-500"
                            : "bg-cyber-lime/10 border-cyber-lime/35 text-cyber-lime"
                        }`}>
                          {log.riskLevel}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-gray-300 font-semibold">{getAiSummaryLabel(log)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR (SCAN LOG DETAILS DRAWER) */}
      {selectedLog && (
        <div className="w-80 bg-[#12141a] border border-gray-900 rounded-xl p-5 shrink-0 flex flex-col justify-between shadow-sm overflow-y-auto">
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-gray-950/60 pb-3">Scan Details</h3>
            
            {/* Domain details block */}
            <div className="space-y-1.5">
              <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Source</span>
              <p className="font-bold text-gray-100 break-all bg-[#0a0b0d] p-3 rounded-lg border border-gray-900">
                {selectedLog.scanType === "email" ? selectedLog.senderDomain || "Unknown sender" : "[Manual Paste Input]"}
              </p>
            </div>

            {/* Length metadata */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0a0b0d] border border-gray-900 p-3 rounded-lg text-center space-y-1">
                <span className="text-[8px] uppercase font-bold text-gray-500 tracking-wide">subjectLength</span>
                <p className="font-bold text-gray-200">{selectedLog.subjectLength} chars</p>
              </div>
              <div className="bg-[#0a0b0d] border border-gray-900 p-3 rounded-lg text-center space-y-1">
                <span className="text-[8px] uppercase font-bold text-gray-500 tracking-wide">bodyLength</span>
                <p className="font-bold text-gray-200">{selectedLog.bodyLength.toLocaleString()} chars</p>
              </div>
            </div>

            {/* ML Duration Slider */}
            <div className="space-y-2 font-semibold">
              <div className="flex justify-between text-[9px] uppercase font-bold text-gray-500">
                <span>ML Analysis Duration</span>
                <span className="text-cyber-cyan glow-cyan">{selectedLog.duration}ms</span>
              </div>
              <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-cyber-cyan h-full rounded-full shadow-[0_0_8px_#00f3ff]"
                  style={{ width: `${Math.min(100, (selectedLog.duration / 150) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Critical Findings Panel */}
            <div className="bg-cyber-red/5 border border-cyber-red/25 p-4 rounded-lg space-y-2.5">
              <span className="text-[9px] font-black text-cyber-red uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-cyber-red shadow-[0_0_4px_#ff3b30]"></span>
                Critical Findings
              </span>
              <ul className="space-y-1.5 list-disc pl-3 text-[10px] text-gray-300 font-semibold">
                {getCriticalFindings(selectedLog).map((finding, idx) => (
                  <li key={idx} className="leading-tight">{finding}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={() => setShowRawModal(true)}
              className="bg-[#0a0b0d] hover:bg-gray-800/40 border border-gray-850 hover:border-gray-700 text-white font-bold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 text-[10px]"
            >
              <FileJson className="h-3.5 w-3.5" />
              View Raw
            </button>
            <button
              onClick={() => alert(`Marked ${selectedLog.senderDomain || 'Paste'} for Quarantine.`)}
              className="bg-cyber-cyan hover:bg-cyber-cyan/85 text-[#0a0b0d] font-bold py-2 px-3 rounded-lg transition-colors text-[10px]"
            >
              Quarantine
            </button>
          </div>
        </div>
      )}

      {/* RAW JSON VIEWER MODAL */}
      {showRawModal && selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
          <div className="bg-[#12141a] border border-cyber-cyan/35 w-full max-w-2xl rounded-xl shadow-[0_0_35px_rgba(0,243,255,0.12)] flex flex-col max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-900 flex justify-between items-center bg-[#171a22] shrink-0">
              <span className="text-xs font-bold text-cyber-cyan uppercase tracking-widest flex items-center gap-2">
                <FileJson className="h-4.5 w-4.5" />
                Raw JSON ScanLog LogRecord
              </span>
              <button
                onClick={() => setShowRawModal(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-[#0a0b0d] text-cyber-lime font-mono text-[10px] whitespace-pre leading-relaxed select-text selection:bg-cyber-cyan selection:text-black">
              {JSON.stringify(selectedLog, null, 2)}
            </div>
            
            <div className="px-6 py-3.5 border-t border-gray-900 flex justify-end bg-[#171a22] shrink-0">
              <button
                onClick={() => setShowRawModal(false)}
                className="bg-cyber-cyan hover:bg-cyber-cyan/85 text-[#0a0b0d] font-bold px-4 py-2 rounded text-[10px] uppercase tracking-wider transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
