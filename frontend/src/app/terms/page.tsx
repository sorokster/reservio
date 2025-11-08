"use client";

import React from "react";
import { HeroTitle } from "@/src/components/common/HeroTitle";
import { SectionTitle } from "@/src/components/common/SectionTitle";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <HeroTitle>Terms of Service</HeroTitle>
            <p className="text-gray-600 mt-4">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Introduction */}
          <section className="mb-12">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <p className="text-gray-700 leading-relaxed">
                Welcome to Reservio. These Terms of Service ("Terms") govern your access to and use of our website, 
                mobile application, and services (collectively, the "Service"). By accessing or using our Service, you 
                agree to be bound by these Terms. If you disagree with any part of these terms, you may not access the Service.
              </p>
            </div>
          </section>

          {/* Acceptance of Terms */}
          <section className="mb-12">
            <SectionTitle>Acceptance of Terms</SectionTitle>
            <div className="mt-6 bg-white p-6 rounded-xl shadow-lg">
              <p className="text-gray-700 leading-relaxed">
                By creating an account, making a reservation, or using any part of our Service, you acknowledge that 
                you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not 
                agree to these Terms, you must not use our Service.
              </p>
            </div>
          </section>

          {/* Use of Service */}
          <section className="mb-12">
            <SectionTitle>Use of Service</SectionTitle>
            <div className="mt-6 space-y-4">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Eligibility</h3>
                <p className="text-gray-600">
                  You must be at least 18 years old to use our Service. By using the Service, you represent and warrant 
                  that you are of legal age to form a binding contract and meet all eligibility requirements.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Registration</h3>
                <p className="text-gray-600 mb-2">
                  To use certain features of our Service, you must register for an account. You agree to:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and update your information to keep it accurate</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Prohibited Uses</h3>
                <p className="text-gray-600 mb-2">
                  You agree not to use the Service:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                  <li>To violate any international, federal, provincial, or state regulations, rules, or laws</li>
                  <li>To infringe upon or violate our intellectual property rights or the rights of others</li>
                  <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                  <li>To submit false or misleading information</li>
                  <li>To upload or transmit viruses or any other type of malicious code</li>
                  <li>To collect or track personal information of others</li>
                  <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
                  <li>For any obscene or immoral purpose</li>
                  <li>To interfere with or circumvent the security features of the Service</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Reservations */}
          <section className="mb-12">
            <SectionTitle>Reservations</SectionTitle>
            <div className="mt-6 space-y-4">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Making Reservations</h3>
                <p className="text-gray-700 leading-relaxed">
                  When you make a reservation through our Service, you are entering into a contract directly with the 
                  restaurant. Reservio acts as an intermediary platform and is not a party to the reservation agreement. 
                  The restaurant is solely responsible for honoring your reservation and providing the services.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Cancellation Policy</h3>
                <p className="text-gray-700 leading-relaxed">
                  Cancellation policies vary by restaurant. You are responsible for reviewing and understanding the 
                  cancellation policy for each reservation. Some restaurants may charge cancellation fees or have 
                  specific cancellation deadlines. We recommend canceling at least 24 hours in advance when possible.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">No-Shows</h3>
                <p className="text-gray-700 leading-relaxed">
                  If you fail to show up for a reservation without canceling, the restaurant may charge a no-show fee. 
                  Repeated no-shows may result in restrictions on your ability to make future reservations.
                </p>
              </div>
            </div>
          </section>

          {/* Payments */}
          <section className="mb-12">
            <SectionTitle>Payments and Fees</SectionTitle>
            <div className="mt-6 bg-white p-6 rounded-xl shadow-lg">
              <p className="text-gray-700 leading-relaxed mb-3">
                Our Service is currently free to use for making reservations. However:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Restaurants may require deposits or prepayments for certain reservations</li>
                <li>Some restaurants may charge cancellation fees as specified in their policies</li>
                <li>Payment for meals and services is made directly to the restaurant</li>
                <li>We reserve the right to introduce fees in the future with advance notice</li>
              </ul>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="mb-12">
            <SectionTitle>Intellectual Property</SectionTitle>
            <div className="mt-6 bg-white p-6 rounded-xl shadow-lg">
              <p className="text-gray-700 leading-relaxed mb-3">
                The Service and its original content, features, and functionality are owned by Reservio and are protected 
                by international copyright, trademark, patent, trade secret, and other intellectual property laws. You 
                may not reproduce, distribute, modify, create derivative works of, publicly display, or exploit any 
                part of the Service without our prior written permission.
              </p>
              <p className="text-gray-700 leading-relaxed">
                You retain ownership of any content you submit, post, or display on the Service. By submitting content, 
                you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute 
                your content for the purpose of operating and promoting the Service.
              </p>
            </div>
          </section>

          {/* User Content */}
          <section className="mb-12">
            <SectionTitle>User Content and Reviews</SectionTitle>
            <div className="mt-6 bg-white p-6 rounded-xl shadow-lg">
              <p className="text-gray-700 leading-relaxed mb-3">
                You may post reviews, comments, and other content on our Service. You agree that:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Your content is accurate and based on your personal experience</li>
                <li>You will not post false, misleading, or defamatory content</li>
                <li>You will not post content that violates any third-party rights</li>
                <li>You grant us the right to use, modify, and display your content</li>
                <li>We reserve the right to remove any content that violates these Terms</li>
              </ul>
            </div>
          </section>

          {/* Disclaimers */}
          <section className="mb-12">
            <SectionTitle>Disclaimers</SectionTitle>
            <div className="mt-6 bg-white p-6 rounded-xl shadow-lg">
              <p className="text-gray-700 leading-relaxed mb-3">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR 
                IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR 
                PURPOSE, OR NON-INFRINGEMENT.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We do not warrant that the Service will be uninterrupted, secure, or error-free. We are not responsible 
                for the quality, safety, or legality of restaurant services, or the accuracy of restaurant information 
                provided through our Service.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-12">
            <SectionTitle>Limitation of Liability</SectionTitle>
            <div className="mt-6 bg-white p-6 rounded-xl shadow-lg">
              <p className="text-gray-700 leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, RESERVIO SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
                SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED 
                DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM 
                YOUR USE OF THE SERVICE.
              </p>
            </div>
          </section>

          {/* Indemnification */}
          <section className="mb-12">
            <SectionTitle>Indemnification</SectionTitle>
            <div className="mt-6 bg-white p-6 rounded-xl shadow-lg">
              <p className="text-gray-700 leading-relaxed">
                You agree to defend, indemnify, and hold harmless Reservio and its officers, directors, employees, and 
                agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable 
                attorney's fees, arising out of or in any way connected with your access to or use of the Service, your 
                violation of these Terms, or your violation of any third-party rights.
              </p>
            </div>
          </section>

          {/* Termination */}
          <section className="mb-12">
            <SectionTitle>Termination</SectionTitle>
            <div className="mt-6 bg-white p-6 rounded-xl shadow-lg">
              <p className="text-gray-700 leading-relaxed mb-3">
                We may terminate or suspend your account and access to the Service immediately, without prior notice or 
                liability, for any reason, including if you breach these Terms. Upon termination, your right to use 
                the Service will immediately cease.
              </p>
              <p className="text-gray-700 leading-relaxed">
                You may terminate your account at any time by contacting us or using the account deletion features in 
                your profile settings.
              </p>
            </div>
          </section>

          {/* Changes to Terms */}
          <section className="mb-12">
            <SectionTitle>Changes to Terms</SectionTitle>
            <div className="mt-6 bg-white p-6 rounded-xl shadow-lg">
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will 
                provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change 
                will be determined at our sole discretion. Your continued use of the Service after any changes 
                constitutes acceptance of the new Terms.
              </p>
            </div>
          </section>

          {/* Governing Law */}
          <section className="mb-12">
            <SectionTitle>Governing Law</SectionTitle>
            <div className="mt-6 bg-white p-6 rounded-xl shadow-lg">
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which 
                Reservio operates, without regard to its conflict of law provisions. Any disputes arising from these 
                Terms or the Service shall be resolved in the appropriate courts of that jurisdiction.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <SectionTitle>Contact Us</SectionTitle>
            <div className="mt-6 bg-white p-6 rounded-xl shadow-lg">
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-gray-600">
                <p>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:legal@reservio.com" className="text-[#8B1C3B] hover:underline">
                    legal@reservio.com
                  </a>
                </p>
                <p>
                  <strong>Address:</strong> Reservio Legal Team, 123 Main Street, City, State, ZIP Code
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

