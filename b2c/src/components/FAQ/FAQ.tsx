"use client";

import React, { useState } from "react";
import { SectionTitle } from "@/src/components/common/SectionTitle";
import { cn } from "@/src/lib/utils";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQProps {
  items?: FAQItem[];
  className?: string;
}

const defaultFAQItems: FAQItem[] = [
  {
    question: "How do I make a reservation?",
    answer: "Simply browse our restaurants, select your preferred date and time, choose a table, and confirm your reservation. You'll receive a confirmation email with all the details.",
  },
  {
    question: "Can I cancel or modify my reservation?",
    answer: "Yes, you can cancel or modify your reservation up to 24 hours before your scheduled time. Go to your profile page, find your reservation, and click 'Cancel' or 'Edit'.",
  },
  {
    question: "Is there a cancellation fee?",
    answer: "No, there are no cancellation fees. However, we ask that you cancel at least 24 hours in advance to allow other guests to book the table.",
  },
  {
    question: "How far in advance can I make a reservation?",
    answer: "You can make reservations up to 30 days in advance. This helps restaurants plan their seating and ensures availability for all guests.",
  },
  {
    question: "What if I'm running late?",
    answer: "If you're running late, please contact the restaurant directly. Most restaurants will hold your table for 15-20 minutes, but it's best to call ahead.",
  },
  {
    question: "Can I make a reservation for a large group?",
    answer: "Yes! When making a reservation, you can specify the number of guests. For groups larger than 8, we recommend contacting the restaurant directly to ensure proper accommodation.",
  },
];

export const FAQ: React.FC<FAQProps> = ({
  items = defaultFAQItems,
  className,
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={cn("py-16", className)}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <SectionTitle>Frequently Asked Questions</SectionTitle>
            <p className="text-gray-600 mt-4">
              Find answers to common questions about making reservations
            </p>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all hover:shadow-md"
                >
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none rounded-xl"
                  >
                    <span className="font-semibold text-gray-900 pr-4">
                      {item.question}
                    </span>
                    <svg
                      className={cn(
                        "w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200",
                        isOpen && "transform rotate-180"
                      )}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300",
                      isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                      {item.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;

