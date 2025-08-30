import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "COM1111 Assistant - Introduction to Computer Science",
  description: "Interactive chatbot to help students learn Introduction to Computer Science concepts",
  keywords: ["COM1111", "Computer Science", "Education", "Chatbot", "Learning"],
  authors: [{ name: "COM1111 Team" }],
  openGraph: {
    title: "COM1111 Assistant",
    description: "Interactive learning assistant for Introduction to Computer Science",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "COM1111 Assistant",
    description: "Interactive learning assistant for Introduction to Computer Science",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
        <footer className="bg-black/30 fixed top-0 start-0 end-0 text-gray-200 text-center text-xs py-2  z-10">
          Design and code by <span className="font-semibold">Sulaimon Yusuf Ayomide</span> —{" "}
          <span className="italic">codewithemperor</span>
        </footer>
      </body>
    </html>
  );
}
