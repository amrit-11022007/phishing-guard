"use client";

import React, { useEffect, useState, useRef } from "react";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from "chart.js";
import { Mail, ShieldAlert, Cpu, AlertOctagon } from "lucide-react";

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

interface Metrics {
  totalScans: number;
  totalScansChange: string;
  phishingBlocked: number;
  phishingBlockedChange: string;
  aiScans: number;
  aiProbabilityAvg: number;
}

interface ChartData {
  labels: string[];
  volume: number[];
  detections: number[];
}

interface LiveThreat {
  id: string;
  title: string;
  source: string;
  flag: string;
  riskLevel: string;
  timeAgo: string;
}

export default function OverviewPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [contentOrigin, setContentOrigin] = useState<any>(null);
  const [liveThreats, setLiveThreats] = useState<LiveThreat[]>([]);
  const [timeframe, setTimeframe] = useState<"30D" | "7D" | "24H">("30D");
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch Stats from backend
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5001/api/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch dashboard metrics");
      }

      const data = await res.json();
      setMetrics(data.metrics);
      setChartData(data.chartData);
      setContentOrigin(data.contentOrigin);
      setLiveThreats(data.liveThreats);
    } catch (err) {
      console.error("Stats fetching error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Establish WebSocket Connection for Real-Time Updates
    const ws = new WebSocket("ws://localhost:5001");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[WS Client] Connected to Cyber Shield Live Stream");
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.event === "NEW_SCAN") {
          console.log("[WS Client] Received live update:", payload.data);
          
          // Re-fetch aggregate stats and charts
          fetchStats();
        }
      } catch (err) {
        console.error("WS parse error:", err);
      }
    };

    ws.onclose = () => {
      console.log("[WS Client] Connection terminated");
    };

    return () => {
      ws.close();
    };
  }, []);

  if (loading || !metrics || !chartData || !contentOrigin) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0a0b0d] text-cyber-cyan font-mono">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyber-cyan border-t-transparent"></div>
          <p className="text-xs tracking-widest animate-pulse font-semibold">SYNCHRONIZING SHIELD STATS...</p>
        </div>
      </div>
    );
  }

  // 1. Line Chart Config (Volume & Detections)
  // Slice charts based on timeframe filter
  let displayLabels = chartData.labels;
  let displayVolume = chartData.volume;
  let displayDetections = chartData.detections;

  if (timeframe === "7D") {
    displayLabels = chartData.labels.slice(-7);
    displayVolume = chartData.volume.slice(-7);
    displayDetections = chartData.detections.slice(-7);
  } else if (timeframe === "24H") {
    displayLabels = chartData.labels.slice(-1);
    displayVolume = chartData.volume.slice(-1);
    displayDetections = chartData.detections.slice(-1);
  }

  const lineChartConfig = {
    labels: displayLabels,
    datasets: [
      {
        label: "Volume",
        data: displayVolume,
        borderColor: "#00f3ff",
        backgroundColor: "rgba(0, 243, 255, 0.03)",
        borderWidth: 3.5,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#00f3ff",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 1.5,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
      {
        label: "Detections",
        data: displayDetections,
        borderColor: "#adff2f",
        borderWidth: 3.5,
        borderDash: [5, 5],
        tension: 0.4,
        fill: false,
        pointBackgroundColor: "#adff2f",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 1.5,
        pointRadius: 2.5,
        pointHoverRadius: 6,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Customized in JSX legend below
      },
      tooltip: {
        backgroundColor: "#12141a",
        titleFont: { family: "monospace", size: 11 },
        bodyFont: { family: "monospace", size: 12 },
        borderColor: "rgba(0, 243, 255, 0.2)",
        borderWidth: 1,
        titleColor: "#9ca3af",
        bodyColor: "#ffffff",
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(31, 41, 55, 0.25)",
        },
        ticks: {
          color: "#4b5563",
          font: { family: "monospace", size: 9 },
        },
      },
      y: {
        grid: {
          color: "rgba(31, 41, 55, 0.25)",
        },
        ticks: {
          color: "#4b5563",
          font: { family: "monospace", size: 9 },
        },
      },
    },
  };

  // 2. Doughnut Chart Config (Content Origin)
  const doughnutChartConfig = {
    labels: ["Human Authored", "AI Generated"],
    datasets: [
      {
        data: [contentOrigin.human, contentOrigin.ai],
        backgroundColor: ["#00e5ff", "#e040fb"],
        borderWidth: 0,
        hoverOffset: 4,
        cutout: "75%",
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#12141a",
        bodyFont: { family: "monospace", size: 12 },
        borderColor: "rgba(224, 64, 251, 0.2)",
        borderWidth: 1,
      },
    },
  };

  return (
    <div className="p-8 h-full overflow-y-auto space-y-6">
      {/* METRIC CARDS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Emails Scanned */}
        <div className="bg-[#12141a] border border-gray-900/60 p-6 rounded-xl flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block font-mono">
              Total Emails Scanned
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {metrics.totalScans.toLocaleString()}
              </span>
              <span className="text-[10px] text-cyber-lime font-bold font-mono">
                ↑{metrics.totalScansChange}
              </span>
            </div>
          </div>
          <div className="h-10 w-10 bg-gray-800/40 border border-gray-850 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-cyber-cyan transition-colors">
            <Mail className="h-5 w-5" />
          </div>
        </div>

        {/* Card 2: Phishing Threats Blocked */}
        <div className="bg-[#12141a] border border-gray-900/60 p-6 rounded-xl flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block font-mono">
              Phishing Threats Blocked
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-cyber-red tracking-tight glow-red">
                {metrics.phishingBlocked.toLocaleString()}
              </span>
              <span className="text-[10px] text-cyber-lime font-bold font-mono">
                ↑{metrics.phishingBlockedChange}
              </span>
            </div>
          </div>
          <div className="h-10 w-10 bg-gray-800/40 border border-gray-850 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-cyber-red transition-colors">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>

        {/* Card 3: AI-Generated Content */}
        <div className="bg-[#12141a] border border-gray-900/60 p-6 rounded-xl flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block font-mono">
              AI-Generated Content
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-cyber-purple tracking-tight">
                {metrics.aiScans.toLocaleString()}
              </span>
              <span className="text-[10px] text-gray-400 font-semibold font-mono">
                Avg. {metrics.aiProbabilityAvg}% Prob.
              </span>
            </div>
          </div>
          <div className="h-10 w-10 bg-gray-800/40 border border-gray-850 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-cyber-purple transition-colors">
            <Cpu className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* CHARTS AND FEEDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2/3: Threat Activity Line Chart */}
        <div className="lg:col-span-2 bg-[#12141a] border border-gray-900/60 p-6 rounded-xl flex flex-col justify-between h-[420px] shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-950/60 pb-4 mb-4 font-mono">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Threat Activity</h3>
            
            {/* Timeline Filter */}
            <div className="flex bg-[#0a0b0d] p-0.5 rounded-lg border border-gray-900 text-[10px]">
              {(["30D", "7D", "24H"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-3 py-1 rounded font-bold uppercase transition-all duration-300 ${
                    timeframe === t
                      ? "bg-gray-800 text-white border border-gray-700/60"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 relative">
            <Line data={lineChartConfig} options={lineChartOptions} />
          </div>

          {/* Custom Chart Legend */}
          <div className="flex gap-6 mt-4 text-[10px] font-mono text-gray-400">
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="h-2 w-4 bg-[#00f3ff] inline-block rounded-sm"></span>
              Volume
            </span>
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="h-0.5 w-4 border-t border-dashed border-[#adff2f] inline-block"></span>
              Detections
            </span>
          </div>
        </div>

        {/* Right 1/3: Content Origin Doughnut & Live Threats */}
        <div className="flex flex-col gap-6">
          {/* Doughnut Chart */}
          <div className="bg-[#12141a] border border-gray-900/60 p-5 rounded-xl flex items-center gap-5 shadow-sm">
            <div className="h-28 w-28 shrink-0 relative flex items-center justify-center">
              <Doughnut data={doughnutChartConfig} options={doughnutChartOptions} />
              <div className="absolute flex flex-col items-center justify-center font-mono">
                <span className="text-lg font-black text-white">{contentOrigin.aiPercent}%</span>
                <span className="text-[8px] text-gray-500 font-bold uppercase">HUMAN</span>
              </div>
            </div>
            
            <div className="flex-1 space-y-3 font-mono">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-gray-950/60 pb-1.5">Content Origin</h3>
              
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="flex items-center gap-1.5 text-gray-450">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00e5ff]"></span>
                    Human Authored
                  </span>
                  <span className="font-bold text-gray-300">{contentOrigin.human.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center text-[10px]">
                  <span className="flex items-center gap-1.5 text-gray-450">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#e040fb]"></span>
                    AI Generated
                  </span>
                  <span className="font-bold text-gray-350">{contentOrigin.ai.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Threats List */}
          <div className="bg-[#12141a] border border-gray-900/60 p-5 rounded-xl flex-1 flex flex-col justify-between font-mono">
            <div className="flex items-center gap-2 border-b border-gray-950/60 pb-3 mb-3">
              <span className="h-2 w-2 rounded-full bg-cyber-red animate-ping shadow-[0_0_8px_#ff3b30]"></span>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Live Threats</h3>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto max-h-[175px] pr-1">
              {liveThreats.map((threat) => (
                <div
                  key={threat.id}
                  className="bg-[#0a0b0d] p-3 rounded-lg border border-gray-900 hover:border-cyber-red/25 transition-all duration-300 flex items-start justify-between relative group overflow-hidden"
                >
                  <div className="space-y-1 overflow-hidden pr-2">
                    <h4 className="text-[10px] font-bold text-gray-250 truncate group-hover:text-white transition-colors">
                      {threat.title}
                    </h4>
                    <p className="text-[9px] text-gray-500 truncate">
                      Source: <span className="text-gray-400">{threat.source}</span>
                    </p>
                    <p className="text-[8px] text-cyber-cyan opacity-80 uppercase tracking-tighter">
                      Flag: {threat.flag}
                    </p>
                  </div>

                  <div className="flex flex-col items-end shrink-0 gap-1.5">
                    <span className={`text-[8px] font-black border px-1 py-0.5 rounded leading-none ${
                      threat.riskLevel === "CRITICAL" || threat.riskLevel === "HIGH"
                        ? "bg-cyber-red/10 border-cyber-red/35 text-cyber-red glow-red"
                        : threat.riskLevel === "MED"
                        ? "bg-cyan-500/10 border-cyan-500/35 text-cyan-500"
                        : "bg-cyber-lime/10 border-cyber-lime/35 text-cyber-lime"
                    }`}>
                      {threat.riskLevel}
                    </span>
                    <span className="text-[8px] text-gray-500 font-semibold">{threat.timeAgo}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
