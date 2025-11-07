"use client";

import React from "react";
import Navigation from "@/src/components/Navigation";
import {NAVIGATION} from "@/src/configs/navigation";

const Header: React.FC = () => {
    return (
        <header className="py-4 bg-white">
            <Navigation navigation={NAVIGATION} />
        </header>
    );
}

export default Header;