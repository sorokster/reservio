"use client";

import React from "react";
import { HeroTitle } from "@/src/components/common/HeroTitle";
import { SectionTitle } from "@/src/components/common/SectionTitle";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <HeroTitle>About Reservio</HeroTitle>
            <p className="text-xl text-gray-600 mt-4 max-w-2xl mx-auto">
              Your trusted platform for seamless restaurant reservations
            </p>
          </div>

          {/* Mission Section */}
          <section className="mb-16">
            <SectionTitle>Our Mission</SectionTitle>
            <div className="mt-6 space-y-4 text-gray-700 leading-relaxed">
              <p>
                At Reservio, we believe that dining out should be a delightful experience from start to finish. 
                Our mission is to connect food lovers with exceptional restaurants while making the reservation 
                process as simple and convenient as possible.
              </p>
              <p>
                We've built a platform that allows you to discover amazing restaurants, browse their menus, 
                read authentic reviews, and book your table in just a few clicks. Whether you're planning a 
                romantic dinner, a business lunch, or a family celebration, Reservio makes it easy to find and 
                reserve the perfect spot.
              </p>
            </div>
          </section>

          {/* What We Offer Section */}
          <section className="mb-16">
            <SectionTitle>What We Offer</SectionTitle>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="w-12 h-12 bg-[#8B1C3B]/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#8B1C3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Discover Restaurants</h3>
                <p className="text-gray-600">
                  Explore a curated selection of restaurants with detailed information, menus, and reviews.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="w-12 h-12 bg-[#8B1C3B]/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#8B1C3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Reservations</h3>
                <p className="text-gray-600">
                  Book your table in seconds with our intuitive reservation system. No phone calls needed.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="w-12 h-12 bg-[#8B1C3B]/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#8B1C3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Real Reviews</h3>
                <p className="text-gray-600">
                  Read authentic reviews from diners and share your own experiences to help others.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="w-12 h-12 bg-[#8B1C3B]/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#8B1C3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Bookings</h3>
                <p className="text-gray-600">
                  Keep track of all your reservations in one place. Modify or cancel anytime.
                </p>
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section className="mb-16">
            <SectionTitle>Our Values</SectionTitle>
            <div className="mt-6 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Simplicity</h3>
                <p className="text-gray-600">
                  We believe in making things simple. Our platform is designed to be intuitive and easy to use, 
                  so you can focus on what matters most - enjoying great food.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Transparency</h3>
                <p className="text-gray-600">
                  We value honesty and transparency. All restaurant information, reviews, and availability are 
                  presented clearly and accurately.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Excellence</h3>
                <p className="text-gray-600">
                  We're committed to providing the best possible experience for both diners and restaurant partners, 
                  continuously improving our platform based on your feedback.
                </p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center bg-gradient-to-br from-[#8B1C3B] to-[#6E152F] rounded-2xl p-12 text-white">
            <h2 className="text-2xl font-bold mb-4">Ready to Start Dining?</h2>
            <p className="text-lg mb-6 opacity-90">
              Discover amazing restaurants and book your next meal with Reservio
            </p>
            <a
              href="/restaurants"
              className="inline-block px-8 py-3 bg-white text-[#8B1C3B] rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Browse Restaurants
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}

