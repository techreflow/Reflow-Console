"use client";

import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { getUserEmail, getUserName } from "@/lib/api";

export default function PrivacyPolicyPage() {
    const userName = getUserName();
    const userEmail = getUserEmail();

    const sections = [
        {
            title: "1. Information We Collect",
            content:
                "We collect information you provide directly, such as your name, email address, organization details, and account credentials. We also automatically collect device telemetry data, usage logs, IP addresses, browser type, and interaction data when you use the ReFlow IoT Console.",
        },
        {
            title: "2. How We Use Your Information",
            items: [
                "Providing, operating, and maintaining the ReFlow IoT Console",
                "Processing device telemetry and generating analytics dashboards",
                "Sending service notifications, alerts, and system updates",
                "Improving our platform features and user experience",
                "Detecting and preventing fraudulent or unauthorized activity",
                "Responding to your support requests and inquiries",
            ],
        },
        {
            title: "3. Device & Telemetry Data",
            content:
                "IoT device data transmitted through the platform (sensor readings, MQTT messages, device status) is stored securely and is accessible only to you and authorized members of your projects. We do not analyze, sell, or share your device data with third parties. Device data is retained as per your account plan and can be exported or deleted upon request.",
        },
        {
            title: "4. Data Storage & Security",
            content:
                "Your data is stored on secure cloud infrastructure with industry-standard encryption at rest and in transit (TLS 1.2+). We implement access controls, audit logging, regular security assessments, and automated threat detection to protect your information. While we take extensive measures to safeguard your data, no system is 100% secure.",
        },
        {
            title: "5. Data Sharing & Disclosure",
            content:
                "We do not sell your personal information. We may share data with trusted service providers who assist us in operating the platform (e.g., cloud hosting, email services) under strict confidentiality agreements. We may disclose information if required by law, regulation, or valid legal process.",
        },
        {
            title: "6. Cookies & Tracking",
            content:
                "We use essential cookies for authentication and session management. We may use analytics cookies to understand how users interact with the console. You can control cookie preferences through your browser settings. Disabling essential cookies may affect platform functionality.",
        },
        {
            title: "7. Your Rights",
            items: [
                "Access and download your personal and device data",
                "Correct inaccurate or incomplete information",
                "Delete your account and associated data",
                "Export your data in standard formats (CSV, JSON)",
                "Opt out of non-essential communications",
                "Restrict processing of your data in certain circumstances",
            ],
        },
        {
            title: "8. Data Retention",
            content:
                "We retain your account information for as long as your account is active. Device telemetry data is retained according to your subscription plan (typically 30–365 days). Upon account deletion, we will remove your personal data within 30 days, except where retention is required by law.",
        },
        {
            title: "9. Third-Party Integrations",
            content:
                "The ReFlow IoT Console may integrate with third-party services (e.g., MQTT brokers, email providers). These services have their own privacy policies, and we encourage you to review them. We are not responsible for the privacy practices of third-party services.",
        },
        {
            title: "10. Children's Privacy",
            content:
                "The ReFlow IoT Console is not intended for use by individuals under the age of 16. We do not knowingly collect personal information from children. If we learn that we have collected data from a child, we will take steps to delete it promptly.",
        },
        {
            title: "11. Changes to This Policy",
            content:
                "We may update this Privacy Policy periodically. We will notify you of material changes via email or a prominent notice within the console. The 'Last updated' date at the top will reflect the most recent revision.",
        },
        {
            title: "12. Contact Us",
            content:
                "If you have questions or concerns about this Privacy Policy or your data, please contact us at privacy@reflowtech.com or through the help center in the console.",
        },
    ];

    return (
        <DashboardLayout
            title="Privacy Policy"
            breadcrumbs={[
                { label: "Workspace", href: "/" },
                { label: "Privacy Policy" },
            ]}
            user={{ name: userName || "", email: userEmail || "" }}
        >
            <div className="max-w-3xl mx-auto space-y-6 pb-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <h2 className="text-2xl font-bold text-text-primary">
                        Privacy Policy
                    </h2>
                    <p className="text-sm text-text-muted mt-1">
                        Last updated: March 2026
                    </p>
                </motion.div>

                {/* Sections */}
                {sections.map((section, index) => (
                    <motion.section
                        key={section.title}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.05 * (index + 1) }}
                        className="rounded-xl bg-white border border-border-subtle p-6"
                    >
                        <h3 className="text-base font-bold text-text-primary mb-3">
                            {section.title}
                        </h3>
                        {section.content ? (
                            <p className="text-sm text-text-secondary leading-relaxed">
                                {section.content}
                            </p>
                        ) : section.items ? (
                            <ul className="space-y-2">
                                {section.items.map((item, i) => (
                                    <li
                                        key={i}
                                        className="flex items-start gap-2 text-sm text-text-secondary leading-relaxed"
                                    >
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </motion.section>
                ))}
            </div>
        </DashboardLayout>
    );
}
