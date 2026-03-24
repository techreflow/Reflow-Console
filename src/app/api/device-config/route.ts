import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_REFLOW_API_URL ?? "https://reflow-backend.fly.dev/api/v1";

/** GET /api/device-config?serialId=AX605
 *  Forwards the user's Authorization header received from the browser.
 */
export async function GET(req: NextRequest) {
    const serialId = new URL(req.url).searchParams.get("serialId");
    if (!serialId) {
        return NextResponse.json({ error: "serialId is required" }, { status: 400 });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const res = await fetch(`${BACKEND}/device/${serialId}/mqtt/config`, {
            headers: { Authorization: authHeader },
            cache: "no-store",
        });
        const json = await res.json();
        return NextResponse.json(json, { status: res.status });
    } catch (err) {
        console.error("[device-config GET]", err);
        return NextResponse.json({ error: "Failed to fetch device config" }, { status: 500 });
    }
}

/** POST /api/device-config?serialId=AX605
 *  Body: { config: { SNO1, MIN1, MAX1, FAC1, CAL1, ... } }
 *  Forwards exactly what the client sends — channel count is determined by the GET response.
 */
export async function POST(req: NextRequest) {
    const serialId = new URL(req.url).searchParams.get("serialId");
    if (!serialId) {
        return NextResponse.json({ error: "serialId is required" }, { status: 400 });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const res = await fetch(`${BACKEND}/device/${serialId}/mqtt/config`, {
            method: "POST",
            headers: {
                Authorization: authHeader,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ config: body.config }),
        });
        const json = await res.json();
        return NextResponse.json(json, { status: res.status });
    } catch (err) {
        console.error("[device-config POST]", err);
        return NextResponse.json({ error: "Failed to publish device config" }, { status: 500 });
    }
}

