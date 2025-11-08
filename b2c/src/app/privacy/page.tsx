"use client";

import React from "react";
import { HeroTitle } from "@/src/components/common/HeroTitle";
import { SectionTitle } from "@/src/components/common/SectionTitle";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <HeroTitle>Privacy Policy</HeroTitle>
            <p className="text-gray-600 mt-4">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Introduction */}
          <section className="mb-12">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <p className="text-gray-700 leading-relaxed">
                At Reservio, we are committed to protecting your privacy. This Privacy Policy explains how we collect, 
                use, disclose, and safeguard your information when you use our website and services. Please read this 
                policy carefully to understand our practices regarding your personal data.
              </p>
            </div>
          </section>

          {/* Information We Collect */}
          <section className="mb-12">
            <SectionTitle>Information We Collect</SectionTitle>
            <div className="mt-6 space-y-4">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
                <p className="text-gray-600 mb-2">
                  When you create an account or make a reservation, we may collect:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Name and contact information (email address, phone number)</li>
                  <li>Account credentials (username, password)</li>
                  <li>Reservation history and preferences</li>
                  <li>Payment information (processed securely through third-party providers)</li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Usage Information</h3>
                <p className="text-gray-600 mb-2">
                  We automatically collect certain information about how you interact with our services:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Device information (IP address, browser type, operating system)</li>
                  <li>Usage data (pages visited, time spent, features used)</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-12">
            <SectionTitle>How We Use Your Information</SectionTitle>
            <div className="mt-6 bg-white p-6 rounded-xl shadow-lg">
              <p className="text-gray-600 mb-3">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Process and manage your reservations</li>
                <li>Provide, maintain, and improve our services</li>
                <li>Send you important updates about your reservations</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Personalize your experience and show relevant content</li>
                <li>Detect, prevent, and address technical issues and security threats</li>
                <li>Comply with legal obligations and enforce our terms of service</li>
              </ul>
            </div>
          </section>

          {/* Information Sharing */}
          <section className="mb-12">
            <SectionTitle>Information Sharing and Disclosure</SectionTitle>
            <div className="mt-6 bg-white p-6 rounded-xl shadow-lg">
              <p className="text-gray-600 mb-3">
                We do not sell your personal information. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li><strong>With Restaurants:</strong> We share your reservation details with the restaurants you book to facilitate your dining experience.</li>
                <li><strong>Service Providers:</strong> We may share information with trusted third-party service providers who assist us in operating our platform.</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights and safety.</li>
                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale, your information may be transferred as part of the transaction.</li>
              </ul>
            </div>
          </section>

          {/* Data Security */}
          <section className="mb-12">
            <SectionTitle>Data Security</SectionTitle>
            <div className="mt-6 bg-white p-6 rounded-xl shadow-lg">
              <p className="text-gray-700 leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the 
                Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-12">
            <SectionTitle>Your Rights</SectionTitle>
            <div className="mt-6 bg-white p-6 rounded-xl shadow-lg">
              <p className="text-gray-600 mb-3">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Access and receive a copy of your personal data</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your personal data</li>
                <li>Object to or restrict certain processing activities</li>
                <li>Data portability (receive your data in a structured format)</li>
                <li>Withdraw consent at any time where we rely on consent</li>
              </ul>
              <p className="text-gray-600 mt-4">
                To exercise these rights, please contact us at{" "}
                <a href="mailto:privacy@reservio.com" className="text-[#8B1C3B] hover:underline">
                  privacy@reservio.com
                </a>
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section className="mb-12">
            <SectionTitle>Cookies and Tracking Technologies</SectionTitle>
            <div className="mt-6 bg-white p-6 rounded-xl shadow-lg">
              <p className="text-gray-700 leading-relaxed">
                We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and assist 
                in our marketing efforts. You can control cookies through your browser settings, but disabling cookies 
                may limit certain features of our services.
              </p>
            </div>
          </section>

          {/* Children's Privacy */}
          <section className="mb-12">
            <SectionTitle>Children's Privacy</SectionTitle>
            <div className="mt-6 bg-white p-6 rounded-xl shadow-lg">
              <p className="text-gray-700 leading-relaxed">
                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal 
                information from children. If you believe we have collected information from a child, please contact 
                us immediately.
              </p>
            </div>
          </section>

          {/* Changes to Policy */}
          <section className="mb-12">
            <SectionTitle>Changes to This Privacy Policy</SectionTitle>
            <div className="mt-6 bg-white p-6 rounded-xl shadow-lg">
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the 
                new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this 
                Privacy Policy periodically for any changes.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <SectionTitle>Contact Us</SectionTitle>
            <div className="mt-6 bg-white p-6 rounded-xl shadow-lg">
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2 text-gray-600">
                <p>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:privacy@reservio.com" className="text-[#8B1C3B] hover:underline">
                    privacy@reservio.com
                  </a>
                </p>
                <p>
                  <strong>Address:</strong> Reservio Privacy Team, 123 Main Street, City, State, ZIP Code
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

