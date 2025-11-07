"use client";

import React from "react";

const About: React.FC = () => {
    return (
      <section className="flex flex-col md:flex-row items-center justify-center gap-10 max-md:px-4 py-12">
          {/* Image */}
          <div className="relative shadow-2xl shadow-rose-600/40 rounded-2xl overflow-hidden shrink-0">
              <img
                className="max-w-md w-full object-cover rounded-2xl"
                src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=600&auto=format&fit=crop"
                alt="Elegant restaurant table booking"
              />

              {/* Social proof bubble */}
              <div className="flex items-center gap-1 max-w-72 absolute bottom-8 left-8 bg-white p-4 rounded-xl">
                  <div className="flex -space-x-4 shrink-0">
                      <img src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=200" alt="customer"
                           className="size-9 rounded-full border-[3px] border-white hover:-translate-y-1 transition z-[1]"/>
                      <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200" alt="customer"
                           className="size-9 rounded-full border-[3px] border-white hover:-translate-y-1 transition z-[2]"/>
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200" alt="customer"
                           className="size-9 rounded-full border-[3px] border-white hover:-translate-y-1 transition z-[3]"/>
                      <div
                        className="flex items-center justify-center text-xs text-white size-9 rounded-full border-[3px] border-white bg-rose-600 hover:-translate-y-1 transition z-[4]">
                          500+
                      </div>
                  </div>
                  <p className="text-sm font-medium text-slate-800">
                      Diners booked today
                  </p>
              </div>
          </div>

          {/* Text */}
          <div className="text-sm text-slate-600 max-w-lg">
              <h1 className="text-xl uppercase font-semibold text-slate-700">About Reservio</h1>
              <div className="w-24 h-[3px] rounded-full bg-gradient-to-r from-rose-600 to-rose-200"></div>

              <p className="mt-8">
                  Reservio helps food lovers around the world discover amazing restaurants and book the perfect table
                  in seconds — anytime, anywhere.
              </p>
              <p className="mt-4">
                  We connect diners with top-rated restaurants, from cozy cafés to Michelin-star dining.
                  No calls, no waiting — just fast, simple, reliable reservations.
              </p>
              <p className="mt-4">
                  With real-time availability, smart filters, and instant confirmation, Reservio makes dining experiences
                  seamless — for guests and restaurants alike.
              </p>

              <button
                className="flex items-center gap-2 mt-8 hover:-translate-y-0.5 transition bg-gradient-to-r from-rose-600 to-rose-500 py-3 px-8 rounded-full text-white"
              >
                  <span>Learn more</span>
                  <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12.53 6.53a.75.75 0 0 0 0-1.06L7.757.697a.75.75 0 1 0-1.06 1.06L10.939 6l-4.242 4.243a.75.75 0 0 0 1.06 1.06zM0 6v.75h12v-1.5H0z"
                        fill="#fff"
                      />
                  </svg>
              </button>
          </div>
      </section>
    );
};

export default About;