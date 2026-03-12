import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Flashcards — AI-powered study cards",
  description:
    "Turn any topic or notes into smart flashcards instantly. Powered by AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="font-sans antialiased">
        {/* Fixed deep-dark background with sky-blue ambient glows */}
        <div className="fixed inset-0 -z-10 bg-[#030712]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-sky-500/[0.07] blur-[140px] rounded-full pointer-events-none" />
          <div className="absolute top-1/2 -translate-y-1/2 right-0 w-[450px] h-[450px] bg-blue-700/[0.04] blur-[110px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-[350px] h-[350px] bg-sky-600/[0.04] blur-[100px] rounded-full pointer-events-none" />
        </div>
        {children}
      </body>
    </html>
  );
}
