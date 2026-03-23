import { NextResponse } from "next/server";

const BACKEND_URL =
    process.env.NEXT_PUBLIC_REFLOW_API_URL ||
    "https://reflow-backend.fly.dev/api/v1";

/**
 * Compute mean absolute deviation % across all channel columns.
 * Formula: |v - avg| / |avg| * 100 per reading per channel, then averaged.
 */
function computeDeviationPct(rows, channelKeys) {
    if (!rows || rows.length === 0) return null;

    // Per-channel averages
    const avgs = {};
    channelKeys.forEach((k) => {
        const vals = rows
            .map((r) => parseFloat(r[k]))
            .filter((v) => !isNaN(v) && isFinite(v));
        avgs[k] = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    });

    const deviations = [];
    rows.forEach((row) => {
        channelKeys.forEach((k) => {
            const v = parseFloat(row[k]);
            const avg = avgs[k];
            if (!isNaN(v) && isFinite(v) && avg !== null && Math.abs(avg) > 0.0001) {
                deviations.push((Math.abs(v - avg) / Math.abs(avg)) * 100);
            }
        });
    });

    if (deviations.length === 0) return null;
    return deviations.reduce((a, b) => a + b, 0) / deviations.length;
}

/**
 * Detect channel keys from a data row (anything that looks like a numeric sensor reading).
 * Analytics page gets SNO1-SNO6 or RawCH1-RawCH6 depending on the source.
 */
function detectChannelKeys(row) {
    if (!row) return [];
    return Object.keys(row).filter((k) => {
        if (k === "timestamp" || k === "createdAt" || k.startsWith("_")) return false;
        const v = parseFloat(row[k]);
        return !isNaN(v) && isFinite(v);
    });
}

/**
 * Fetch historical data for a device through the backend export API.
 * Mirrors the call pattern in exportDeviceData in lib/api.ts.
 */
async function fetchDeviceData(serial, startDate, endDate, authToken) {
    try {
        const body = { startDate, endDate };
        const res = await fetch(`${BACKEND_URL}/device/${serial}/export`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) return null;
        const raw = await res.json();

        // Backend may return array directly or nested
        const rows = Array.isArray(raw)
            ? raw
            : raw?.data || raw?.readings || raw?.deviceData || [];

        return Array.isArray(rows) && rows.length > 0 ? rows : null;
    } catch {
        return null;
    }
}

// ── GET handler ─────────────────────────────────────────────────────────────
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "today"; // today | weekly | monthly
    const serialsParam = searchParams.get("serials") || "";
    const serials = serialsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    if (serials.length === 0) {
        return NextResponse.json({ error: "No serials provided" }, { status: 400 });
    }

    // Pull auth token from the Authorization header forwarded by the client
    const authToken = request.headers.get("x-auth-token") || "";

    const now = new Date();

    // ── Helper: deviation % for a batch of devices over a date range ─────────
    async function batchDeviation(startIso, endIso) {
        const results = await Promise.allSettled(
            serials.map((serial) => fetchDeviceData(serial, startIso, endIso, authToken))
        );
        const allDeviations = [];
        let totalReadings = 0;
        results.forEach((r) => {
            if (r.status === "fulfilled" && r.value) {
                const rows = r.value;
                totalReadings += rows.length;
                const keys = detectChannelKeys(rows[0] || {});
                if (keys.length > 0) {
                    const pct = computeDeviationPct(rows, keys);
                    if (pct !== null) allDeviations.push(pct);
                }
            }
        });
        const avgPct =
            allDeviations.length > 0
                ? allDeviations.reduce((a, b) => a + b, 0) / allDeviations.length
                : null;
        return { avgDeviationPct: avgPct, totalReadings };
    }

    // ── TODAY ────────────────────────────────────────────────────────────────
    if (period === "today") {
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        const { avgDeviationPct, totalReadings } = await batchDeviation(
            startOfDay.toISOString(),
            now.toISOString()
        );
        return NextResponse.json({ avgDeviationPct, totalReadings });
    }

    // ── WEEKLY / MONTHLY ─────────────────────────────────────────────────────
    const days = period === "weekly" ? 7 : 30;
    const trend = [];

    for (let i = days - 1; i >= 0; i--) {
        const dayStart = new Date(now);
        dayStart.setDate(dayStart.getDate() - i);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);

        const { avgDeviationPct } = await batchDeviation(
            dayStart.toISOString(),
            dayEnd.toISOString()
        );
        trend.push({
            date: dayStart.toISOString().split("T")[0],
            avgDeviationPct,
        });
    }

    return NextResponse.json({ trend });
}
