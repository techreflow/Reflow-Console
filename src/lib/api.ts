/**
 * ReFlow Backend API Service
 * 
 * Connects to the real ReFlow backend at https://reflow-backend.fly.dev/api/v1
 * All endpoints use Bearer token authentication.
 */

const BASE_URL = process.env.NEXT_PUBLIC_REFLOW_API_URL || "https://reflow-backend.fly.dev/api/v1";

function getToken(): string {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
        if (!token) {
            // Strictly enforce session bounds
            deleteCookie("auth_token");
            deleteCookie("username");
            deleteCookie("fullName");
            return "";
        }
        return token;
    }
    return "";
}

function getHeaders(): HeadersInit {
    const token = getToken();
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}


async function handleResponse(res: Response) {
    let data;
    try {
        data = await res.json();
    } catch {
        data = null;
    }
    
    if (!res.ok || (data && data.success === false)) {
        throw new Error(data?.message || data?.error || `HTTP error ${res.status}`);
    }
    
    return data;
}

// ──────────────────────────────
// Auth
// ──────────────────────────────

export async function signup(email: string, name: string, password: string, contactNumber?: string) {
    const res = await fetch(`${BASE_URL}/auth/user/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password, ...(contactNumber ? { contactNumber } : {}) }),
    });
    return handleResponse(res);
}

export async function login(email: string, password: string) {
    const res = await fetch(`${BASE_URL}/auth/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
}

export async function generateOTP(email: string, action: string = "signup") {
    const res = await fetch(`${BASE_URL}/auth/user/generate/otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, action }),
    });
    return handleResponse(res);
}

export async function verifyOTP(email: string, verificationCode: string) {
    const res = await fetch(`${BASE_URL}/auth/user/verify/otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, verificationCode }),
    });
    const data = await handleResponse(res);
    // Auto-save token with both sessionStorage and cookies
    if (data?.data?.token) {
        saveToken(data.data.token);
    }
    return data;
}

// ──────────────────────────────
// Organization
// ──────────────────────────────

export async function getOrganization() {
    const res = await fetch(`${BASE_URL}/organization`, {
        headers: getHeaders(),
    });
    const data = await handleResponse(res);
    return { ok: true, status: res.status, ...data };
}

export async function createOrganization(name: string, description: string) {
    const res = await fetch(`${BASE_URL}/organization`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ name, description }),
    });
    return handleResponse(res);
}

export async function updateOrganization(data: { name?: string; description?: string }) {
    const res = await fetch(`${BASE_URL}/organization`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}

export async function inviteToOrganization(email: string, role: string = "MEMBER") {
    const res = await fetch(`${BASE_URL}/organization/invite`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email, role }),
    });
    return handleResponse(res);
}

export async function removeMember(memberId: string) {
    const res = await fetch(`${BASE_URL}/organization/member/${memberId}`, {
        method: "DELETE",
        headers: getHeaders(),
    });
    return handleResponse(res);
}

export async function leaveOrganization() {
    const res = await fetch(`${BASE_URL}/organization/leave`, {
        method: "POST",
        headers: getHeaders(),
    });
    return handleResponse(res);
}

export async function transferOwnership(newOwnerId: string) {
    const res = await fetch(`${BASE_URL}/organization/transfer-ownership`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ newOwnerId }),
    });
    return handleResponse(res);
}

export async function getOrganizationActivities() {
    const res = await fetch(`${BASE_URL}/organization/activities`, {
        headers: getHeaders(),
    });
    return handleResponse(res);
}

// ──────────────────────────────
// Projects
// ──────────────────────────────

export async function getAllProjects() {
    const res = await fetch(`${BASE_URL}/projects`, {
        headers: getHeaders(),
    });
    return handleResponse(res);
}

export async function createProject(name: string, description: string) {
    const res = await fetch(`${BASE_URL}/project`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ name, description }),
    });
    return handleResponse(res);
}

export async function updateProject(projectId: string, data: { name?: string; description?: string }) {
    const res = await fetch(`${BASE_URL}/project/${projectId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}

export async function deleteProject(projectId: string) {
    const res = await fetch(`${BASE_URL}/project/${projectId}`, {
        method: "DELETE",
        headers: getHeaders(),
    });
    return handleResponse(res);
}

export async function shareProject(projectId: string, userEmail: string, role: string = "EDITOR") {
    const res = await fetch(`${BASE_URL}/project/${projectId}/share`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ userEmail, role }),
    });
    return handleResponse(res);
}

// ──────────────────────────────
// Devices
// ──────────────────────────────

export async function getProjectDevices(projectId: string) {
    const res = await fetch(`${BASE_URL}/project/${projectId}/devices`, {
        headers: getHeaders(),
    });
    return handleResponse(res);
}

export async function getDeviceDetails(deviceId: string) {
    const res = await fetch(`${BASE_URL}/device/${deviceId}`, {
        headers: getHeaders(),
    });
    return handleResponse(res);
}

export async function createDevice(
    projectId: string,
    serialNumber: string,
    subscriptionKey: string,
    name: string,
    description: string
) {
    const res = await fetch(`${BASE_URL}/project/${projectId}/device`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ serialNumber, subscriptionKey, name, description }),
    });
    
    return handleResponse(res);
}

export async function updateDevice(deviceId: string, data: { name?: string; description?: string }) {
    const res = await fetch(`${BASE_URL}/device/${deviceId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}

export async function moveDevice(deviceId: string, newProjectId: string) {
    const res = await fetch(`${BASE_URL}/device/${deviceId}/move`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ newProjectId }),
    });
    return handleResponse(res);
}

export async function deleteDevice(deviceId: string) {
    const res = await fetch(`${BASE_URL}/device/${deviceId}`, {
        method: "DELETE",
        headers: getHeaders(),
    });
    return handleResponse(res);
}

export async function exportDeviceData(deviceId: string, startDate: string, endDate: string, interval?: string) {
    const body: any = { startDate, endDate };
    if (interval) body.interval = interval;
    
    const res = await fetch(`${BASE_URL}/device/${deviceId}/export`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(body),
    });
    return handleResponse(res);
}

// ──────────────────────────────
// Health
// ──────────────────────────────

export async function healthCheck() {
    const res = await fetch(`${BASE_URL}/health`);
    return handleResponse(res);
}

// ──────────────────────────────
// Token management helpers
// ──────────────────────────────

/**
 * Set cookie in browser (client-side only)
 * This is used to store auth token in cookies so middleware can access it
 */
function setCookie(name: string, value: string, days?: number) {
    if (typeof document === "undefined") return; // Skip on server
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = `expires=${date.toUTCString()}; `;
    }
    // Format: name=value; expires=...; path=/; SameSite=Lax; secure (if HTTPS)
    const cookieString = `${name}=${encodeURIComponent(value)}; ${expires}path=/; SameSite=Lax`;
    console.log(`[SetCookie] Setting: ${name}`);
    document.cookie = cookieString;
    
    // Verify cookie was set
    const testCookie = document.cookie.split(';').some(cookie => 
        cookie.trim().startsWith(name + '=')
    );
    console.log(`[SetCookie] Verified ${name}: ${testCookie}`);
}

/**
 * Get cookie from browser (client-side only)
 */
function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null; // Skip on server
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(nameEQ)) {
            try {
                return decodeURIComponent(cookie.substring(nameEQ.length));
            } catch (e) {
                return cookie.substring(nameEQ.length);
            }
        }
    }
    return null;
}

/**
 * Delete cookie from browser (client-side only)
 */
function deleteCookie(name: string) {
    if (typeof document === "undefined") return; // Skip on server
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function isAuthenticated(): boolean {
    return !!getToken();
}

export function saveToken(token: string) {
    // Save to both localStorage/sessionStorage (client-side) and cookies (for middleware)
    localStorage.setItem("auth_token", token);
    sessionStorage.setItem("auth_token", token);
    setCookie("auth_token", token, 1); // 1 day expiry
}

export function clearAuth() {
    // Clear from sessionStorage
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("fullName");
    sessionStorage.removeItem("org_confirmed");
    sessionStorage.removeItem("org_setup_skipped");
    
    // Clear from localStorage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("username");
    localStorage.removeItem("fullName");
    localStorage.removeItem("org_confirmed");
    localStorage.removeItem("org_setup_skipped");

    // Clear from cookies
    deleteCookie("auth_token");
    deleteCookie("username");
    deleteCookie("fullName");
    deleteCookie("org_confirmed");
}

export function saveUserInfo(email: string, name: string) {
    // Save to localStorage/sessionStorage (client-side)
    localStorage.setItem("username", email);
    localStorage.setItem("fullName", name);
    sessionStorage.setItem("username", email);
    sessionStorage.setItem("fullName", name);
    
    // Save to cookies (for middleware)
    setCookie("username", email, 1); // 1 day expiry
    setCookie("fullName", name, 1); // 1 day expiry
}

export function saveOrgConfirmed() {
    localStorage.setItem("org_confirmed", "true");
    sessionStorage.setItem("org_confirmed", "true");
    setCookie("org_confirmed", "true", 1);
}

export function saveOrgSetupSkipped() {
    localStorage.setItem("org_setup_skipped", "true");
    sessionStorage.setItem("org_setup_skipped", "true");
    setCookie("org_setup_skipped", "true", 1);
}

export function getUserEmail(): string {
    if (typeof window !== "undefined") {
        return localStorage.getItem("username") || sessionStorage.getItem("username") || "";
    }
    return "";
}

export function getUserName(): string {
    if (typeof window !== "undefined") {
        return localStorage.getItem("fullName") || sessionStorage.getItem("fullName") || "";
    }
    return "";
}
