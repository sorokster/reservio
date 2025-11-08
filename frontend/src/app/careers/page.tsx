"use client";

import React from "react";
import { HeroTitle } from "@/src/components/common/HeroTitle";
import { SectionTitle } from "@/src/components/common/SectionTitle";

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <HeroTitle>Careers at Reservio</HeroTitle>
            <p className="text-xl text-gray-600 mt-4 max-w-2xl mx-auto">
              Join our team and help shape the future of restaurant reservations
            </p>
          </div>

          {/* Why Work With Us Section */}
          <section className="mb-16">
            <SectionTitle>Why Work With Us</SectionTitle>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="w-12 h-12 bg-[#8B1C3B]/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#8B1C3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Innovation</h3>
                <p className="text-gray-600">
                  Work on cutting-edge technology and help build innovative solutions that transform the dining experience.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="w-12 h-12 bg-[#8B1C3B]/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#8B1C3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Great Team</h3>
                <p className="text-gray-600">
                  Collaborate with talented, passionate people who are dedicated to creating exceptional experiences.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="w-12 h-12 bg-[#8B1C3B]/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#8B1C3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Growth Opportunities</h3>
                <p className="text-gray-600">
                  Advance your career with continuous learning opportunities and professional development programs.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="w-12 h-12 bg-[#8B1C3B]/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#8B1C3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Competitive Benefits</h3>
                <p className="text-gray-600">
                  Enjoy comprehensive benefits package including health insurance, flexible work arrangements, and more.
                </p>
              </div>
            </div>
          </section>

          {/* Our Culture Section */}
          <section className="mb-16">
            <SectionTitle>Our Culture</SectionTitle>
            <div className="mt-6 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Collaborative Environment</h3>
                <p className="text-gray-600">
                  We believe in the power of teamwork. Our open communication culture encourages everyone to share ideas, 
                  ask questions, and contribute to our collective success.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Work-Life Balance</h3>
                <p className="text-gray-600">
                  We understand that great work comes from well-rested, happy team members. We offer flexible schedules 
                  and remote work options to help you maintain a healthy work-life balance.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Diversity & Inclusion</h3>
                <p className="text-gray-600">
                  We're committed to building a diverse and inclusive workplace where everyone feels valued, respected, 
                  and empowered to bring their authentic selves to work.
                </p>
              </div>
            </div>
          </section>

          {/* Open Positions Section */}
          <section className="mb-16">
            <SectionTitle>Open Positions</SectionTitle>
            <div className="mt-6 bg-white p-8 rounded-xl shadow-lg text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Open Positions at the Moment</h3>
              <p className="text-gray-600 mb-6">
                We're not currently hiring, but we're always interested in connecting with talented individuals. 
                Feel free to reach out to us at{" "}
                <a href="mailto:careers@reservio.com" className="text-[#8B1C3B] hover:underline">
                  careers@reservio.com
                </a>{" "}
                and we'll keep your information on file for future opportunities.
              </p>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center bg-gradient-to-br from-[#8B1C3B] to-[#6E152F] rounded-2xl p-12 text-white">
            <h2 className="text-2xl font-bold mb-4">Interested in Joining Our Team?</h2>
            <p className="text-lg mb-6 opacity-90">
              Even if we don't have open positions right now, we'd love to hear from you
            </p>
            <a
              href="/contact"
              className="inline-block px-8 py-3 bg-white text-[#8B1C3B] rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Get in Touch
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}

