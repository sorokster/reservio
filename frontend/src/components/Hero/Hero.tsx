"use client";

import React from "react";

const Hero: React.FC = () => {
    return (
        <div className="py-16">
            {/* Hero Section */}
            <div className="relative flex flex-col items-center justify-center text-sm px-4 md:px-16 lg:px-24 xl:px-40 text-black">
                <div className="absolute top-28 xl:top-10 -z-10 left-1/4 size-72 sm:size-96 bg-[#8B1C3B] blur-[100px] opacity-30"></div>

                {/* Avatars + Stars */}
                <div className="flex items-center mt-24">
                    <div className="flex -space-x-3 pr-3">
                        <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200" className="size-8 rounded-full border-2 border-white" />
                        <img src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200" className="size-8 rounded-full border-2 border-white" />
                        <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200" className="size-8 rounded-full border-2 border-white" />
                        <img src="https://randomuser.me/api/portraits/men/75.jpg" className="size-8 rounded-full border-2 border-white" />
                    </div>

                    <div>
                        <div className="flex">
                            {Array(5).fill(0).map((_, i) => (
                                <svg key={i} width="16" height="16" fill="#8B1C3B">
                                    <path d="M11.525 2.295..."></path>
                                </svg>
                            ))}
                        </div>
                        <p className="text-sm text-gray-700">
                            Trusted by 10,000+ diners
                        </p>
                    </div>
                </div>

                {/* Headline */}
                <h1 className="text-4xl md:text-5xl font-semibold max-w-5xl text-center mt-4">
                    Seamless table booking for <span className="bg-gradient-to-r from-[#8B1C3B] to-[#8B1C3B] bg-clip-text text-transparent">fine-dining restaurants</span>
                </h1>

                <p className="max-w-md text-center text-sm my-7">
                    Discover, reserve, and enjoy the best restaurants with real-time availability.
                </p>

                {/* CTA Buttons */}
                <div className="flex items-center gap-4">
                    <a href="/restaurants" className="bg-[#8B1C3B] hover:bg-[#6E152F] text-white rounded-full px-9 py-4 m-1 ring-offset-2 ring-1 ring-[#8B1C3B]">
                        Explore restaurants
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Hero;