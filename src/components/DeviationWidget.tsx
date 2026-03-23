"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import { useProjects } from "@/lib/ProjectsContext";

interface TrendPoint {
    date: string;
    avgDeviationPct: number | null;
}

interface TodayData {
    avgDeviationPct: number | null;
    totalReadings: number;
}

function getColor(pct: number | null): string {
    if (pct === null) return "bg-slate-200";
    if (pct < 5) return "bg-emerald-400";
    if (pct < 15) return "bg-amber-400";
    return "bg-red-400";
}

function getBadgeStyle(pct: number | null): string {
    if (pct === null) return "bg-slate-100 text-slate-500";
    if (pct < 5) return "bg-emerald-50 text-emerald-700";
    if (pct < 15) return "bg-amber-50 text-amber-700";
    return "bg-red-50 text-red-700";
}

function SparkBars({ data, label }: { data: TrendPoint[]; label: string }) {
    const max = Math.max(1, ...data.map((d) => d.avgDeviationPct ?? 0));

    return (
        <div className="mb-4">
            <p className="text-[11px] text-text-muted mb-2">{label}</p>
            <div className="flex items-end gap-[3px] h-12">
                {data.map((pt, i) => {
                    const pct = pt.avgDeviationPct;
                    const height = pct !== null ? Math.max(4, Math.round((pct / max) * 100)) : 4;
                    const dateLabel = new Date(pt.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                    });
                    return (
                        <motion.div
                            key={pt.date}
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{ duration: 0.4, delay: 0.05 * i }}
                            className={`flex-1 rounded-t-sm ${getColor(pct)} cursor-default`}
                            title={
                                pct !== null
                                    ? `${dateLabel}: ${pct.toFixed(1)}%`
                                    : `${dateLabel}: No data`
                            }
                        />
                    );
                })}
            </div>
        </div>
    );
}

export default function DeviationWidget() {
    const { devices, loading: devicesLoading } = useProjects();

    const [today, setToday] = useState<TodayData | null>(null);
    const [weekly, setWeekly] = useState<TrendPoint[]>([]);
    const [monthly, setMonthly] = useState<TrendPoint[]>([]);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Collect all device serial numbers
    const serials = devices
        .map((d: any) => d.serialNumber || d.serial_no || d.serialNo || d.serial_number || "")
        .filter(Boolean)
        .join(",");

    const fetchAll = useCallback(async () => {
        if (!serials) return;
        setFetching(true);
        setError(null);
        try {
            const token =
                (typeof window !== "undefined" &&
                    (localStorage.getItem("auth_token") ||
                        sessionStorage.getItem("auth_token"))) ||
                "";
            const headers: HeadersInit = token ? { "x-auth-token": token } : {};
            const base = `/api/deviation-stats?serials=${encodeURIComponent(serials)}`;
            const [todayRes, weeklyRes, monthlyRes] = await Promise.all([
                fetch(`${base}&period=today`, { headers }),
                fetch(`${base}&period=weekly`, { headers }),
                fetch(`${base}&period=monthly`, { headers }),
            ]);

            if (!todayRes.ok || !weeklyRes.ok || !monthlyRes.ok) {
                throw new Error("API error");
            }

            const [todayData, weeklyData, monthlyData] = await Promise.all([
                todayRes.json(),
                weeklyRes.json(),
                monthlyRes.json(),
            ]);

            setToday(todayData);
            setWeekly(weeklyData.trend || []);
            setMonthly(monthlyData.trend || []);
        } catch {
            setError("Could not load deviation data.");
        } finally {
            setFetching(false);
        }
    }, [serials]);

    // Initial fetch when devices are ready
    useEffect(() => {
        if (!devicesLoading && serials) fetchAll();
    }, [devicesLoading, serials, fetchAll]);

    // Refresh today's value every 30s
    useEffect(() => {
        if (!serials) return;
        const interval = setInterval(async () => {
            try {
                const token =
                    (typeof window !== "undefined" &&
                        (localStorage.getItem("auth_token") ||
                            sessionStorage.getItem("auth_token"))) ||
                    "";
                const headers: HeadersInit = token ? { "x-auth-token": token } : {};
                const res = await fetch(
                    `/api/deviation-stats?serials=${encodeURIComponent(serials)}&period=today`,
                    { headers }
                );
                if (res.ok) {
                    const data = await res.json();
                    setToday(data);
                }
            } catch {}
        }, 30_000);
        return () => clearInterval(interval);
    }, [serials]);

    // Trend direction: compare today vs. yesterday (last point in weekly)
    const yesterdayPct =
        weekly.length >= 2 ? weekly[weekly.length - 2]?.avgDeviationPct : null;
    const todayPct = today?.avgDeviationPct ?? null;

    let trendDir: "up" | "down" | "flat" | null = null;
    if (todayPct !== null && yesterdayPct !== null) {
        if (todayPct > yesterdayPct + 0.5) trendDir = "up";
        else if (todayPct < yesterdayPct - 0.5) trendDir = "down";
        else trendDir = "flat";
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="rounded-xl bg-white border border-border-subtle p-5"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-text-primary">Deviations</h3>
                {!fetching && todayPct !== null && (
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getBadgeStyle(todayPct)}`}>
                        {todayPct < 5 ? "Normal" : todayPct < 15 ? "Moderate" : "High"}
                    </span>
                )}
            </div>

            {/* Today's value */}
            <div className="mb-5">
                <p className="text-[11px] text-text-muted mb-1">Today's Avg Deviation</p>
                {fetching || devicesLoading ? (
                    <div className="h-9 w-24 bg-slate-100 rounded-lg animate-pulse" />
                ) : error ? (
                    <div className="flex items-center gap-1.5 text-xs text-amber-600">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {error}
                    </div>
                ) : serials.length === 0 ? (
                    <p className="text-sm text-text-muted">No devices registered</p>
                ) : (
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-black text-text-primary">
                            {todayPct !== null ? `${todayPct.toFixed(1)}%` : "—"}
                        </span>
                        {trendDir && (
                            <div className="mb-1 flex items-center gap-1">
                                {trendDir === "up" && (
                                    <span className="flex items-center gap-0.5 text-[11px] font-semibold text-red-600">
                                        <TrendingUp className="w-3.5 h-3.5" /> Rising
                                    </span>
                                )}
                                {trendDir === "down" && (
                                    <span className="flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600">
                                        <TrendingDown className="w-3.5 h-3.5" /> Falling
                                    </span>
                                )}
                                {trendDir === "flat" && (
                                    <span className="flex items-center gap-0.5 text-[11px] font-semibold text-slate-500">
                                        <Minus className="w-3.5 h-3.5" /> Stable
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                )}
                {today?.totalReadings !== undefined && today.totalReadings > 0 && (
                    <p className="text-[10px] text-text-muted mt-0.5">{today.totalReadings.toLocaleString()} readings today</p>
                )}
            </div>

            {/* Spark charts */}
            {fetching ? (
                <div className="space-y-4">
                    {[1, 2].map((k) => (
                        <div key={k}>
                            <div className="h-3 w-16 bg-slate-100 rounded mb-2 animate-pulse" />
                            <div className="flex items-end gap-[3px] h-12">
                                {Array.from({ length: k === 1 ? 7 : 30 }).map((_, i) => (
                                    <div key={i} className="flex-1 bg-slate-100 rounded-t-sm animate-pulse" style={{ height: `${30 + Math.random() * 50}%` }} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : !error && serials.length > 0 ? (
                <>
                    {weekly.length > 0 && <SparkBars data={weekly} label="Weekly Trend (last 7 days)" />}
                    {monthly.length > 0 && <SparkBars data={monthly} label="Monthly Trend (last 30 days)" />}
                </>
            ) : null}

            {/* Colour legend */}
            {!fetching && !error && serials.length > 0 && (
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border-subtle">
                    {[
                        { color: "bg-emerald-400", label: "< 5%" },
                        { color: "bg-amber-400", label: "5-15%" },
                        { color: "bg-red-400", label: "> 15%" },
                    ].map((item) => (
                        <div key={item.label} className="flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-sm ${item.color}`} />
                            <span className="text-[10px] text-text-muted">{item.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
