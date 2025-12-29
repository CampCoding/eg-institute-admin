import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DashLayout from "@/layout/DashLayout";
import { Toaster } from "react-hot-toast";
import ProviderWrapper from "../utils/Provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Eg-institute | Dashboard",
  description: "Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ProviderWrapper>
          <DashLayout>{children}</DashLayout>
          <Toaster position="top-center" />
        </ProviderWrapper>
      </body>
    </html>
  );
}
