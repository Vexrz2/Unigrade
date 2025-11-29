import type { Metadata } from "next";
import "./globals.css";
import UserContextProvider from "@/context/UserContext";
import QueryProvider from "@/lib/QueryProvider";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Unigrade",
  description: "Unigrade - Platform for students",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className + " bg-theme2"}>
        <QueryProvider>
          <UserContextProvider>
            <main className="min-h-screen">
              <Navbar />
              {children}
            </main>
            <Footer />
          </UserContextProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
