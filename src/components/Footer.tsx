"use client";

import Link from "next/link";

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-border-subtle bg-surface px-8 py-4 flex items-center justify-between text-xs text-text-muted">
            <p>© {year} ReFlow IoT Systems. All rights reserved.</p>
            <div className="flex items-center gap-6">
                <Link href="/terms-of-service" className="hover:text-text-primary transition-colors">
                    Terms of Service
                </Link>
                <Link href="/privacy-policy" className="hover:text-text-primary transition-colors">
                    Privacy Policy
                </Link>
            </div>
        </footer>
    );
}
