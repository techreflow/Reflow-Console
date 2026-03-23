"use client";

import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { getUserEmail, getUserName } from "@/lib/api";

export default function TermsOfServicePage() {
    const userName = getUserName();
    const userEmail = getUserEmail();

    const sections = [
        {
            title: "1. Acceptance of Terms",
            content:
                'By accessing or using the ReFlow IoT Console ("Service"), you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, you may not access or use the Service.',
        },
        {
            title: "2. Description of Service",
            content:
                "ReFlow IoT Console provides a cloud-based platform for managing, monitoring, and controlling industrial IoT devices. The Service includes device registration, real-time data visualization, MQTT-based communication, alert configuration, and project collaboration features.",
        },
        {
            title: "3. User Accounts",
            content:
                "You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. ReFlow Technologies is not liable for any loss or damage arising from your failure to protect your login information.",
        },
        {
            title: "4. Data Ownership & Privacy",
            content:
                "You retain ownership of all data transmitted through your IoT devices. ReFlow Technologies will not sell, share, or disclose your device data to third parties without your explicit consent, except as required by law. Data collected by the platform is used solely for providing and improving the Service.",
        },
        {
            title: "5. Acceptable Use",
            content:
                "You agree not to misuse the Service. This includes, but is not limited to: attempting to gain unauthorized access to other users' accounts or data, using the Service for any illegal or unauthorized purpose, interfering with or disrupting the integrity or performance of the Service, and transmitting any malicious code or harmful data through the platform.",
        },
        {
            title: "6. Service Availability",
            content:
                "ReFlow Technologies strives to maintain 99.9% uptime for the Service. However, we do not guarantee uninterrupted access and may perform scheduled maintenance with prior notice. We are not liable for any downtime due to circumstances beyond our control, including but not limited to natural disasters, ISP failures, or third-party service outages.",
        },
        {
            title: "7. Intellectual Property",
            content:
                "All intellectual property rights in the Service, including software, design, and documentation, are owned by ReFlow Technologies. You may not copy, modify, distribute, or reverse engineer any part of the Service without prior written consent.",
        },
        {
            title: "8. Limitation of Liability",
            content:
                'The Service is provided "as is" without warranties of any kind, either express or implied. ReFlow Technologies shall not be liable for any indirect, incidental, special, or consequential damages arising from the use or inability to use the Service.',
        },
        {
            title: "9. Termination",
            content:
                "We may terminate or suspend your access to the Service at any time, with or without cause, with or without notice. Upon termination, your right to use the Service ceases immediately. You may export your data before account termination by contacting support.",
        },
        {
            title: "10. Changes to Terms",
            content:
                "ReFlow Technologies reserves the right to modify these Terms at any time. We will notify users of significant changes via email or through the console dashboard. Continued use of the Service after changes constitutes acceptance of the new terms.",
        },
        {
            title: "11. Governing Law",
            content:
                "These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which ReFlow Technologies operates, without regard to conflict of law provisions.",
        },
        {
            title: "12. Contact Information",
            content:
                "If you have questions about these Terms of Service, please contact us at support@reflowtech.com or through the help center in the console.",
        },
    ];

    return (
        <DashboardLayout
            title="Terms of Service"
            breadcrumbs={[
                { label: "Workspace", href: "/" },
                { label: "Terms of Service" },
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
                        Terms of Service
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
                        <p className="text-sm text-text-secondary leading-relaxed">
                            {section.content}
                        </p>
                    </motion.section>
                ))}
            </div>
        </DashboardLayout>
    );
}
