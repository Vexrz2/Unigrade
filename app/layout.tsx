import type { Metadata } from "next";
import "./globals.css";
import UserContextProvider from "@/context/UserContext";
import QueryProvider from "@/lib/QueryProvider";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";

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
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#1f2937',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
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
