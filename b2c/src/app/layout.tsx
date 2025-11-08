import Header from "@/src/components/Header";
import Footer from "@/src/components/Footer";
import { DM_Sans } from "next/font/google";
import SessionProvider from "@/src/components/Auth/SessionProvider";
import Preloader from "@/src/components/common/Preloader";

import "@/src/styles/globals.css";
import "@/src/styles/variables.css";

const DMSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
    <body className={`${DMSans.variable} antialiased`}>
    <SessionProvider>
      <Preloader />
      <main className="main">
        <Header />
        <div className="content">
          {children}
        </div>
        <Footer />
      </main>
    </SessionProvider>
    </body>
    </html>
  );
}